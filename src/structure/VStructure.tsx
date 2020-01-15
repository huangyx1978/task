import * as React from 'react';
import { nav, Image, VPage, Prop, IconText, FA, PropGrid, LMR, Page } from 'tonva';
import {CStructure} from './CStructure'

const cli="list-group-item cursor-pointer";
const Li = (caption:string,onClick:()=>void,index:number) => <li className={cli} onClick={onClick} key={index}>{caption}</li>;
interface InfoItem{
    caption:string,
    onClick:()=>void
}

export class VStructure extends VPage<CStructure>{
   async open(param?: any){
        
    }

    private arr:InfoItem[]=[
        {caption:"公司机构",onClick:this.controller.showCompany},
        {caption:"部门",onClick:this.controller.showDepartment},
        {caption:"职员",onClick:this.controller.showStaffMember}
    ]


    render(){
        return <Page header="组织架构" headerClassName="bg-info">
            <div>
            <ul className="list-group">
                {this.arr.map((v,index)=>{
                   return Li(v.caption,v.onClick,index);//输出单个项的UI
                })}
            </ul>
            </div>
        </Page>
    }
    
}