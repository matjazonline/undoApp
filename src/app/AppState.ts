import {AppStateService, StateAction} from "./simple-rx-store/app-state.service";
import {Injectable, Inject} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import {Observable, Subject} from 'rxjs/Rx'
/**
 * Created by matjazhi on 9.8.2016.
 */

@Injectable()
export class AppState {

  public static STATE_NAME_UNDO_LIST = "undoList";
  public static STATE_NAME_SELECTED_UNDO = "selectedUndo";
  public static UNDO_GET_LIST:string = "undoList.getList";
  public static UNDO_CREATE:string = "undoList.create";
  public static UNDO_REMOVE:string = "undoList.remove";
  public static UNDO_UPDATE:string = "undoList.update";
  public static UNDO_SELECT:string = "selectedUndo.set";

  public appStateVO:Observable<AppStateVO>;

  constructor(@Inject(AppStateService) private appStateService:AppStateService) {
    //this.userService = new UserService(http);
    this.initActionHandlers(appStateService);
    this.appStateVO = appStateService.getAppState().map(appStateObj=> {
      return new AppStateVO(appStateObj);
    })
  }

  initActionHandlers(appStateSer:AppStateService):void {

    appStateSer.registerStateActionHandler(AppState.UNDO_GET_LIST, (param, undosListState:any[])=> {
      if(!undosListState || undosListState.length<1) {
        return [{title: "app state", desc: "based on react \n faster when immutable values and OnPush"},{title: "testing", desc: "description"},{title: "security", desc: "description"},{title: "RxJS", desc: "description"},{title: "modules", desc: "description"},{title: "forms", desc: "description"},{title: "ng-cli", desc: "description"}];
      }
    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_CREATE, (undoObj, undosListState:any[])=> {

      let newUndosList = [undoObj, ...undosListState];
      this.newAction(AppState.UNDO_SELECT,undoObj);
      return newUndosList;

    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_REMOVE, (undoObj, undosListState:any[])=> {

      /*if(this.selectedUndo===undo){
        this.selectedUndo = null;
      }*/
      var removeFromIndex:number = undosListState.findIndex((undo)=>{
        return undo.title === undoObj.title;
      });
      if(removeFromIndex>-1) {
        undosListState.splice(removeFromIndex, 1);
      }

      let newUndosList = [...undosListState];
      //this.newAction(AppState.UNDO_SELECT,undoObj);
      return newUndosList;

    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_UPDATE, (undoObj, undosListState:any[])=> {

      var existingUndoIndex:number = undosListState.findIndex((undo)=>{
        return undo.title === undoObj.title;
      });

      if(existingUndoIndex>-1) {
        let existingUndo = undosListState[existingUndoIndex];
        let newUndoWithUpdates = Object.assign( existingUndo, undoObj);
        //let newUndoWithUpdates = Object.assign({}, existingUndo, undoObj);
        //undosListState.splice(existingUndoIndex, 1, newUndoWithUpdates);
        //return [...undosListState]
      }

    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_SELECT, (undoObj, currentlySelected:any)=> {
      return undoObj;
    }, AppState.STATE_NAME_SELECTED_UNDO, null);


  }

  newAction(eventConst:string, value?:any, stateObjectId?:string):Promise<any> {
    return this.appStateService.newAction(new StateAction(eventConst, value, stateObjectId));
  }

}

export class AppStateVO {
  public undoList:any[];
  public selectedUndo: any;

  constructor(fromObj?:Object) {
    if (fromObj) {
      Object.assign(this, fromObj);
    }
  }

}
