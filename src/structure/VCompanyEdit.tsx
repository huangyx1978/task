import * as React from 'react';
import { nav, Image, VPage, Prop, IconText, FA, PropGrid, LMR, Page, UiSchema, Schema, UiTextItem, Form, UiTextAreaItem, UiButton, Context } from 'tonva';
import {CStructure} from './CStructure';
import { stringify } from 'querystring';

export class VCompanyEdit extends VPage<CStructure>{
    async open(company:any){
        this.openPage(this.page,company);
    }

    private  buttonclick= async (name:string,context:Context)=> {
        if(name=='commit')
        {
           let ret= await this.controller.saveCompnayItem(context.data);
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

    private page=(company:any)=>{
        
        //let formdate={no:company.no,name:company.name,abbreviation:company.abbreviation,address:company.address,telephone:company.telephone,note:company.note};
         let formdate={...company};//将参数对象的属性自动生成同名元素的Json对象,效果等同上一句
       

        let schema: Schema=[
            {name:'no', type:'number',required:true},
            {name:'name', type:'string' ,required:true},
            {name:'abbreviation', type:'string'},
            {name:'address', type:'string'},
            {name:'telephone', type:'string'},
            {name:'note', type:'string'},
            {name:'commit', type:'submit'}
        ];

        let uis: UiSchema={
            items:{
                no: {widget: 'text', label: '编号', placeholder: '请输入编号'} as UiTextItem,
                name:{widget: 'text', label: '名称', placeholder: '请输入名称'} as UiTextItem,
                abbreviation:{widget: 'text', label: '简称'} as UiTextItem,
                address:{widget: 'textarea', label: '注册地址'} as UiTextAreaItem,
                telephone:{widget: 'text', label: '联系电话'} as UiTextItem,
                note:{widget: 'textarea', label: '备注'} as UiTextAreaItem,     
                commit:{widget:'button', label: '提交',className:'btn btn-primary w-100'} as UiButton 
            }
        };
        
        let caption=company.id<0?'新增公司机构':company.name;

        return <Page header={caption} headerClassName="bg-primary" back="close">
            <Form schema={schema} uiSchema={uis} formData={formdate} fieldLabelSize={2} onButtonClick={this.buttonclick} className="m-5"/>
        </Page>
    }
}