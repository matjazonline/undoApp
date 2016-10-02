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
  public static UNDO_GET_LIST: string = "undoList.getList";
  public static UNDO_CREATE: string = "undoList.create";
  public static UNDO_REMOVE: string = "undoList.remove";
  public static UNDO_UPDATE: string = "undoList.update";
  public static UNDO_SELECT: string = "selectedUndo.set";

  public appStateVO: Observable<AppStateVO>;

  constructor(@Inject(AppStateService) private appStateService: AppStateService) {
    //this.userService = new UserService(http);
    this.initActionHandlers(appStateService);
    this.appStateVO = appStateService.getAppState().map(appStateObj=> {
      return new AppStateVO(appStateObj);
    })
  }

  initActionHandlers(appStateSer: AppStateService): void {

    appStateSer.registerStateActionHandler(AppState.UNDO_GET_LIST, (param, undosListState: any[])=> {
      if (!undosListState || undosListState.length < 1) {
        return [{
          title: "app state",
          desc: `based on Redux - events and global app state\n 
                  local value updates inside components\n
                  optimal performance with immutable values and ChangeDetectionStrategy.OnPush\n
                  ChangeDetectionStrategy.OnPush updates only on @Input immutable value change or Observable change\n
                  \n
                  `,
          resources:[
            {title:'app state / blog', author:'by Viktor Savkin', href:'https://vsavkin.com/managing-state-in-angular-2-applications-caf78d123d02#.hnelotviq'},
            {title:'app state / video', author:'by Pavithra Kodmad', href:'https://www.youtube.com/watch?v=_G-e59CZRqw'},
            {title:'change detection', href:'http://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html'}
          ]
        }, {
          title: "testing",
          desc: ``,
          resources:[
            {title:'app state / blog', author:'by Viktor Savkin', href:'https://vsavkin.com/managing-state-in-angular-2-applications-caf78d123d02#.hnelotviq'},
            {title:'app state / video', author:'by Pavithra Kodmad', href:'https://www.youtube.com/watch?v=_G-e59CZRqw'},
            {title:'change detection', href:'http://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html'}
          ]},
          {title: "security", desc: "description"}, {
          title: "RxJS",
          desc: "description"
        }, {title: "modules", desc: "description"}, {title: "forms", desc: "description"},
          {
            title: "security",
            desc: `limited JS expressions inside templates\n
                  white list policy compared to vulnerable black list policy in NG1\n
                  
                    \n`,
            resources:[
              {title:'cross site requests / video', author:'by Dave Smith', href:'https://www.youtube.com/watch?v=9inczw6qtpY'},
              {title:'secure NG apps / video', author:'by Gleb Bahmutov', href:'https://www.youtube.com/watch?v=8M5JQwVtdxo'},
            ]},
          {
            title: "ng-cli tool",
            desc: `generates app boilerplate\n
                    generates module, component, directive, service, ...\n
                    new features already setup - AOT compiler, treeshake with included webpack, NGUniversal\n
                    \n`,
            resources:[
              {title:'compiler / video', author:'by Tobias Bosch', href:'https://www.youtube.com/watch?v=kW9cJsvcsGo'},
            ]},
          {
            title: "Augury tool",
            desc: `view and change component properties runtime\n
                  visualize component tree\n
                  performance characteristics\n
                    \n`,
            resources:[
              {title:'Augury tool / video', author:'by Igor Kamenetsky', href:'https://www.youtube.com/watch?v=55vvJbrDgqw'},
            ]}
        ];
      }
    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_CREATE, (undoObj, undosListState: any[])=> {

      let newUndosList = [undoObj, ...undosListState];
      this.newAction(AppState.UNDO_SELECT, undoObj);
      return newUndosList;

    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_REMOVE, (undoObj, undosListState: any[])=> {

      /*if(this.selectedUndo===undo){
       this.selectedUndo = null;
       }*/
      var removeFromIndex: number = undosListState.findIndex((undo)=> {
        return undo.title === undoObj.title;
      });
      if (removeFromIndex > -1) {
        undosListState.splice(removeFromIndex, 1);
      }

      let newUndosList = [...undosListState];
      //this.newAction(AppState.UNDO_SELECT,undoObj);
      return newUndosList;

    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_UPDATE, (undoObj, undosListState: any[])=> {
      console.log(undosListState, "?????");
      var existingUndoIndex: number = undosListState.findIndex((undo)=> {
        console.log(undo, undoObj, "obj");
        return undo.title == undoObj.title;
      });

      if (existingUndoIndex > -1) {
        console.log(existingUndoIndex, "index.");
        Object.assign(undosListState[existingUndoIndex], undoObj)
        // let existingUndo = ;
        // let newUndoWithUpdates = ;
        //let newUndoWithUpdates = Object.assign({}, existingUndo, undoObj);
        //undosListState.splice(existingUndoIndex, 1, newUndoWithUpdates);
        //return [...undosListState]
      }
      return undosListState;
    }, AppState.STATE_NAME_UNDO_LIST, null);

    appStateSer.registerStateActionHandler(AppState.UNDO_SELECT, (undoObj, currentlySelected: any)=> {
      return undoObj;
    }, AppState.STATE_NAME_SELECTED_UNDO, null);


  }

  newAction(eventConst: string, value?: any, stateObjectId?: string): Promise<any> {
    return this.appStateService.newAction(new StateAction(eventConst, value, stateObjectId));
  }

}

export class AppStateVO {
  public undoList: any[];
  public selectedUndo: any;

  constructor(fromObj?: Object) {
    if (fromObj) {
      Object.assign(this, fromObj);
    }
  }

}