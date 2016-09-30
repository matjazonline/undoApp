import {Component, ViewChild, ElementRef, Renderer, ChangeDetectionStrategy} from '@angular/core';
import {AppStateService} from "./simple-rx-store/app-state.service";
import {AppState} from "./AppState";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  @ViewChild("addNew")
  addNewInput: ElementRef;
  @ViewChild("description")
  descriptionInput: ElementRef;
  selectedUndo:any;
  //undos: any[] = [{title: "app state", desc: "based on react \n faster when immutable values and OnPush"},{title: "undo1", desc: "description"},{title: "undo1", desc: "description"},{title: "undo1", desc: "description"},{title: "undo1", desc: "description"},{title: "undo1", desc: "description"}];

  constructor(private renderer:Renderer, private appStateService:AppState){
    appStateService.appStateVO.subscribe((stateVO)=> {
      console.log("updated state VO", stateVO);
      this.selectedUndo = stateVO.selectedUndo;
    });
    this.appStateService.newAction(AppState.UNDO_GET_LIST, null, null);
  }

  onAddKey(ev:any){
    if(ev.keyCode==13) {
      this.appStateService.newAction(AppState.UNDO_CREATE, {title: ev.srcElement.value, desc: ""}, null);
      this.renderer.setElementProperty(this.addNewInput.nativeElement, "value", "");
      setTimeout(()=> {
        this.renderer.setElementProperty(this.descriptionInput.nativeElement, "value", "");
        this.renderer.invokeElementMethod(this.descriptionInput.nativeElement, "focus");
      });

    }
  }

  selectUndo(undo:any){
    this.appStateService.newAction(AppState.UNDO_SELECT,undo);
  }
  undone(undo:any){
    this.appStateService.newAction(AppState.UNDO_REMOVE, undo);
  }
  update(undo:any){
    this.appStateService.newAction(AppState.UNDO_UPDATE, undo);
  }
}
