import {Injectable, Inject} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs/Rx';
import {filter} from "rxjs/operator/filter";
import {scan} from "rxjs/operator/scan";
import {of} from "rxjs/observable/of";
import {empty} from "rxjs/observable/empty";
import {Subject, ReplaySubject, Subscription} from "rxjs/Rx";

@Injectable()
export class AppStateService {

  private eventStateIdExecutorsArr:StateObjectActions[] = [];
  private eventStateIdExecutors:ReplaySubject<StateObjectActions> = new ReplaySubject<StateObjectActions>();
  private actions = new Subject <StateAction>();
  private appState:Observable<Object>;

  constructor() {
    let initState:Object = {};
    this.appState = this.initEventListeners(initState, this.actions)
  }

  private wrapIntoBehavior(init, obs):BehaviorSubject<Object> {
    const res = new BehaviorSubject(init);
    if (obs) {
      obs.subscribe(s => {
        res.next(s)
      });
    }

    return res;
  }

  /*init(initState?:Object):void{
   if(!this.appState){
   this.appState = this.initEventListeners(initState||{}, this.actions);
   } else {
   console.info("AppStateService already inited.")
   }
   }*/

  getAppState():Observable<Object> {
    return this.appState;
  }

  initEventListeners(initState:Object, actionStream:Observable<StateAction>):BehaviorSubject<Object> {

    const appStateObs:Observable<Object> = this.eventStateIdExecutors
      .map((currEvStateConf:StateObjectActions)=> {
        return currEvStateConf.initActionListeners(actionStream)
          .map(stateIdUpdatedValue=> {
            let keyValObj:Object = {};
            keyValObj[currEvStateConf.stateObjectId] = stateIdUpdatedValue;
            return keyValObj;
          });
      })
      .flatMap(s=> {
        return s;
      }).scan((lastAppState, stateIdKeyVal)=> {
        let newStateKeyVal:Object = Object.assign({}, lastAppState, stateIdKeyVal);
        return newStateKeyVal;
      }, initState);

    return this.wrapIntoBehavior(initState, appStateObs);
  }

  setAppStateForId(stateObjectId:string, initState:any):StateObjectActions {
    var currEvState:StateObjectActions = this.getAppStateForId(stateObjectId);
    if (currEvState == null) {
      currEvState = new StateObjectActions(stateObjectId, initState);
      this.eventStateIdExecutorsArr.push(currEvState);
      this.eventStateIdExecutors.next(currEvState);
    } else {
      currEvState.initState = initState;
    }
    return currEvState;
  }

  getAppStateForId(stateObjectId:string, initState?:any):StateObjectActions {
    let stateIdObj:StateObjectActions;
    stateIdObj = this.eventStateIdExecutorsArr.find(evSt=> {
      return evSt.stateObjectId == stateObjectId
    });
    if (!stateIdObj && initState !== undefined) {
      stateIdObj = this.setAppStateForId(stateObjectId, initState);
    }
    return stateIdObj;
  }

  registerStateActionHandler( eventConst:string, eventFn:Function, stateObjectId:string,initState?:any):void {

    let eventState:StateObjectActions = this.getAppStateForId(stateObjectId, initState || null);
    eventState.setStateActionHandler(new StateActionHandler(stateObjectId, eventConst, eventFn));

  }

  newAction(stateAction:StateAction):Promise<any> {
    var completePromise:Promise<any> = new Promise((res, rej)=> {
      stateAction.onActionComplete = res;
      stateAction.onActionError = rej;
    });
    this.actions.next(stateAction);
    return completePromise;
  }

}

class StateObjectActions {

  public eventExecutors:StateActionHandler[] = [];
  public initState:any = null;

  constructor(public stateObjectId:string, initState?:any) {
    if (initState !== undefined) {
      this.initState = initState;
    }
  }

  initActionListeners(actions:Observable<StateAction>):Observable<any> {
    return actions.flatMap((action:StateAction)=> {
      if (action.stateObjectId == null || this.stateObjectId == action.stateObjectId) {
        let evExecutor:StateActionHandler = this.eventExecutors.find(evExe=> {
          var match:boolean = evExe.eventConst == action.stateActionId;
          return action.stateObjectId == null ? match : match && action.stateObjectId == evExe.stateObjectId;
        });

        if (evExecutor != null) {
          return Observable.of([action, evExecutor]);
        } else {
          if (action.stateObjectId != null) {
            console.warn("No action handler found for action:", action);
          }
          return Observable.empty();
        }
      }

    })
      .scan((state:any, action0evExecutor1:any[])=> {
        let evExecutor:StateActionHandler = action0evExecutor1[1];
        let action:StateAction = action0evExecutor1[0];
        let newStateObs:BehaviorSubject<any> = new BehaviorSubject(undefined);


        state.take(1).subscribe((stateVal:any)=> {

          var actionResult = evExecutor.eventFn(action.value, stateVal, action);
          if (actionResult instanceof Promise) {
            actionResult.then(
              (resVal)=> {
              newStateObs.next(resVal);
                if (action.onActionComplete) {
                  action.onActionComplete(resVal);
                }
            },
            (rejVal)=>{
              newStateObs.next(rejVal);
              if (action.onActionError) {
                action.onActionError(rejVal);
              }
            })
          } else {
            newStateObs.next(actionResult);
            if (action.onActionComplete && !action.customResolve) {
              action.onActionComplete(actionResult);
            }
          }

        });
        return newStateObs

      }, Observable.of(this.initState)).flatMap((val)=> {
        return val
      }).filter(res=> {
        return res !== undefined;
      });
    /*works - without delayed action handler results

     .scan((state:any, action0evExecutor1:any[] )=> {
     let evExecutor:StateActionHandler = action0evExecutor1[1];
     let action:StateAction = action0evExecutor1[0];
     if (evExecutor) {
     var actionResult = evExecutor.eventFn(action.value, state);

     if (action.onActionComplete) {
     action.onActionComplete(actionResult);
     }
     return actionResult;
     }
     //... return promise and .scan later
     //return state;

     }, this.initState)
     .filter(res=> {
     return res !== undefined;
     });*/
  }

  getStateActionHandler(eventConst:string) {
    this.eventExecutors.find((conf:StateActionHandler)=> {
      return conf.eventConst == eventConst;
    });
  }

  setStateActionHandler(eventExecutor:StateActionHandler) {
    if (this.stateObjectId !== eventExecutor.stateObjectId) {
      throw new Error("stateObjectId of parameter does not match")
    }
    let eventExecutorConfigInd = this.eventExecutors.findIndex((conf:StateActionHandler)=> {
      return conf.eventConst == eventExecutor.eventConst;
    });
    if (eventExecutorConfigInd > -1) {
      this.eventExecutors[eventExecutorConfigInd] = eventExecutor;
    } else {
      this.eventExecutors.push(eventExecutor);
    }
  }

}

class StateActionHandler {
  constructor(public stateObjectId:string, public eventConst:string, public eventFn:Function) {
  }
}

export class StateAction {
  constructor(public stateActionId:string, public value:any, public stateObjectId?:string, public onActionComplete?:Function, public onActionError?:Function, public customResolve?:boolean) {
  }
}
