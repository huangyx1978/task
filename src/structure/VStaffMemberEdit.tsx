import * as React from 'react';
import { nav, Image, VPage, Prop, IconText, FA, PropGrid, LMR, Page, UiSchema, Schema, UiTextItem, Form, UiTextAreaItem, UiButton, Context, UiIdItem, UiRange, NumSchema, tv, ImageUploader, UiImageItem } from 'tonva';
import {CStructure} from './CStructure';
import { stringify } from 'querystring';
import { VCallCompany } from './VCallCompany';

export class VStaffMemberEdit extends VPage<CStructure>{
    async open(staff:any){
        this.openPage(this.page,staff);
    }

    private  buttonclick= async (name:string,context:Context)=> {
        if(name=='commit')
        {
           let ret= await this.controller.saveStaffItem(context.data);
           if(ret.id===0)
           {
             context.setError('no', '编号重复');
           }
           else
           {
            this.closePage();
           }
        }
    }

    /*private departmentpickid = async (context: Context, name: string, value: number)=> {
        let ret = await this.controller.calldepartmen();
        return ret;
    }

    private renderDepartment = (item: any) => {
        let boxId = this.controller.boxDepartment(item);//根据基础信息id获取基础信息
        return tv(boxId,(values) => <span>{values.name}</span>);//将基础信息的内容进行组织并输出
        //return tv(boxId);//不带第二个参数的时候,内容输出格式在 tvs.tsx中定义
    }*/

    /*获取返回的图片*/
    private onImageSaved = async (imageId:string) => {
        alert(imageId);
    } 

    /*打开上传图片的也页面*/
    private uploadImage = () => {
        this.openPageElement(<ImageUploader onSaved={this.onImageSaved} />);
    }

    private page=(staff:any)=>{
        
        //let formdate={no:company.no,name:company.name,abbreviation:company.abbreviation,address:company.address,telephone:company.telephone,note:company.note};
         let formdate={...staff};//将参数对象的属性自动生成同名元素的Json对象,效果等同上一句
       

        let schema: Schema=[
            {name:'no', type:'string',required:true},
            {name:'name', type:'string' ,required:true},
            {name:'gender', type:'string'},
            {name:'image', type:'string'},
            {name:'note', type:'string'},
            {name:'commit', type:'submit'}
        ];

        let uis: UiSchema={
            items:{
                no: {widget: 'text', label: '工号', placeholder: '请输入工号'} as UiTextItem,
                name:{widget: 'text', label: '名称', placeholder: '请输入名称'} as UiTextItem,
                gender:{widget: 'text', label: '性别'} as UiTextItem,
                image:{widget: 'image', label: '头像'} as UiImageItem,
                note:{widget: 'textarea', label: '备注' } as UiTextAreaItem,
                commit:{widget:'button', label: '提交',className:'btn btn-primary w-100'} as UiButton 
            }
        };
        
        let caption=staff.id<0?'新增职员':staff.name;

        return <Page header={caption} headerClassName="bg-primary" back="close">
            <Form schema={schema} uiSchema={uis} formData={formdate} fieldLabelSize={2} onButtonClick={this.buttonclick} className="m-3"/>

            {/*<button onClick={this.uploadImage}>hh</button>*/}
            {/*<Image src=":0-0164.jpg" />*/}
        </Page>
    }
}