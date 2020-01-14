import * as React from 'react';
import { nav, Image, VPage, Prop, IconText, FA, PropGrid, LMR, Page, UiSchema, Schema, UiTextItem, Form, UiTextAreaItem, UiButton, Context, UiIdItem, UiRange, NumSchema } from 'tonva';
import {CHyx} from './CHyx';
import { stringify } from 'querystring';
import { VCallCompany } from './VCallCompany';

export class VDepartmentEdit extends VPage<CHyx>{
    async open(department:any){
        this.openPage(this.page,department);
    }

    private  buttonclick= async (name:string,context:Context)=> {
        if(name=='commit')
        {
           let ret= await this.controller.saveDepartmentItem(context.data);
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

    private companypickid = async (context: Context, name: string, value: number)=>{
        let ret = await this.controller.callcompany();
        return ret;
    }

    private departmentpickid = async (context: Context, name: string, value: number)=> {
        let ret = await this.controller.calldepartmen();
        return ret;
    }

    private page=(department:any)=>{
        
        //let formdate={no:company.no,name:company.name,abbreviation:company.abbreviation,address:company.address,telephone:company.telephone,note:company.note};
         let formdate={...department};//将参数对象的属性自动生成同名元素的Json对象,效果等同上一句
       

        let schema: Schema=[
            {name:'no', type:'number',required:true},
            {name:'name', type:'string' ,required:true},
            {name:'abbreviation', type:'string'},
            {name:'company', type:'id'},
            {name:'parent', type:'id'},
            {name:'level', type:'number'} as NumSchema,
            //{name:'level', type:'number', min:3, max: 6 } as NumSchema,
            {name:'note', type:'string'},
            {name:'commit', type:'submit'}
        ];

        let uis: UiSchema={
            items:{
                no: {widget: 'text', label: '编号', placeholder: '请输入编号'} as UiTextItem,
                name:{widget: 'text', label: '名称', placeholder: '请输入名称'} as UiTextItem,
                abbreviation:{widget: 'text', label: '简称'} as UiTextItem,
                company:{widget: 'id', label: '所属公司机构', pickId: this.companypickid} as UiIdItem,//通过pickId来调用打开选取公司机构的弹出窗体
                parent:{widget: 'id', label: '上级部门', pickId: this.departmentpickid} as UiIdItem,//通过pickId来调用打开选取部门的弹出窗体
                level:{widget:'updown', label: '层级' },
                note:{widget: 'textarea', label: '备注' } as UiTextAreaItem,
                commit:{widget:'button', label: '提交',className:'btn btn-primary w-100'} as UiButton 
            }
        };
        
        let caption=department.id<0?'新增部门':department.name;

        return <Page header={caption} headerClassName="bg-primary" back="close">
            <Form schema={schema} uiSchema={uis} formData={formdate} fieldLabelSize={2} onButtonClick={this.buttonclick} className="m-5"/>
        </Page>
    }
}