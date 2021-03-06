import { CUqBase } from "tonvaApp";
import { observable } from "mobx";
import _ from 'lodash';
import {VStructure} from './VStructure'
import { QueryPager, Query, NumSchema } from "tonva";
import { VCompanyList } from "./VCompanyList";
import { VCompanyEdit } from "./VCompanyEdit";
import { VDepartMentList } from "./VDepartMentList";
import { VDepartmentEdit } from "./VDepartmentEdit";
import { VCallCompany } from "./VCallCompany";
import { VCallDepartment } from "./VCallDepartment";
import { VStaffMemberList } from "./VStaffMemberList";
import { TuidSaveResult } from "tonva/dist/uq/tuid/tuid";
import { createNo } from "tool/tools";
import { Vtest } from "./Vtest";
import { CApp } from "CApp";
import { VStaffMemberEdit } from "./VStaffMemberEdit";

interface owDepartment {
    owner: number;
    id: number;
    department:number;
    position:string;
}

interface Staff {
    id: number;
    no: string;
    name: string;
    gender:number;
    image:string;
    note: string;
    disabled:number;
    department: owDepartment[];
}

export class CStructure extends CUqBase{
    pager: QueryPager<any>;//定义全局的支持分页查询的操作对象,在此定义的全局对象,在后面的View里都能通过this.controller来调用
    callpager:QueryPager<any>;
    pagertest:QueryPager<any>;

    /*必需的定义*/
    protected async internalStart(){
        this.pagertest = new QueryPager(this.uqs.task.QueryCompany, 10, 30);//实例化分页查询操作对象
        this.pagertest.setItemDeepObservable();//执行这个方法后可实现绑定了当前paper的View自动刷新显示
        await this.pagertest.first({key:''});//执行第一次查询,前面需要加await,因为这是异步查询
    }

    //tab = () =>this.renderView(Vtest);//必需的定义
    tab = () =>this.renderView(VStructure);//必需的定义

    querycompanylist = async()=>{

    }

    boxCompany(id:number) {
        return this.uqs.task.Company.boxId(id);//boxId是根据id获取基础信息,获取字段列表为TUID里定义为main的字段
    }

    boxDepartment(id:number) {
        return this.uqs.task.Department.boxId(id);//boxId是根据id获取基础信息,获取字段列表为TUID里定义为main的字段
    }

    /********************************************************************************************************************/
    /***********************************************公司机构**************************************************************/
    /********************************************************************************************************************/
    /*打开公司机构列表,增加async表示是异步执行*/
    company:any;

    showCompany =async ()=>{
        //let ret=await  this.uqs.task.Company.search('',0,10);//执行平台自动生成的基础信息查询
        this.pager = new QueryPager(this.uqs.task.QueryCompany, 10, 30);//实例化分页查询操作对象
        this.pager.setItemDeepObservable();//执行这个方法后可实现绑定了当前paper的View自动刷新显示
        await this.pager.first({key:''});//执行第一次查询,前面需要加await,因为这是异步查询
        this.openVPage(VCompanyList);//openVPage可以传第二个参数,如果有传第二个参数,则对应view里面的open方法需要定义入参用于接收改参数,query的查询结果对应数组类型any[]
    }

    /*查询公司机构列表*/
    querycompnay =async (seachcode:string,pagestart:number,pagesize:number):Promise<any>=>{

        let ret=await this.uqs.task.Company.search(seachcode,pagestart,pagesize);
        return ret;
    }

    private getemptyCompnay=():any=>{
       return {id: -1,no: '', name: '',seachcode: '', abbreviation: '',address: '', telephone:'', note:''}
    }

    /*打开公司机构新建界面*/
    showNewCompany = async () => {
        this.company=this.getemptyCompnay();
        /*生成编号*/
        let newno= await this.uqs.task.Company.no();
        let no= createNo(newno);
        this.company.no = no;
        /*生成编号*/

        this.openVPage(VCompanyEdit,this.company);
    }
    /*打开公司机构编辑界面*/
    showEditCompnay =(company:any)=>{//company:any=undefined 表示company参数不传值时用等号后面的值赋值,company?:any 表示company可传可不传
        this.company = company; 
        this.openVPage(VCompanyEdit,this.company);
    }

    /*保存公司机构*/
    saveCompnayItem = async (company:any):Promise<TuidSaveResult>=>{//因是异步调用,所以返回类型需要写成Promise<返回类型>
        let {id} = this.company;
        let ret= await this.uqs.task.Company.save(id, company);//id传-1或0是显示表示新增,id>0显示的更新,id为undefined则先拿no查id,然后以id来进行更新,如果查不要id则新增
        if(ret.id>0)//ret.id为保存后返回的的基础信息id,id=0表示失败,id>0表示成功,id<0表示为做任何更改,ret.inid调用save方法是传入的原始id值,
        {
            if(id<0)//新增的            
            {   
                this.company.id= ret.id;
                let data = _.merge({}, this.company, company);//把参数2和参数3依次和参数1进行合并      
                this.pager.items.unshift(data);
            }
            else//修改
            {
                let index = this.pager.items.findIndex(v => v.id === id);
                if (index>=0) {
                    _.merge(this.pager.items[index], company);
                }
            }
        }

        return ret;
    }

    /********************************************************************************************************************/
    /***********************************************部门信息**************************************************************/
    /********************************************************************************************************************/
    department: any;

    showDepartment =async ()=>{
        this.pager=new QueryPager(this.uqs.task.QueryDepartments, 10, 30);
        this.pager.setItemDeepObservable();
        this.pager.first({key:''})
        this.openVPage(VDepartMentList);
    }

    private getemptyDepartment=():any=>{
        return {id: -1,no: '', name: '',seachcode: '', abbreviation: '',company: -1, companyno:'', companyname:'', parent:-1, parentno:'', parentname:'', note:'', disabled:0}
     }

     showNewDepartment = async () => {
         this.department=this.getemptyDepartment();
         /*生成编号*/
         let newno= await this.uqs.task.Department.no();
         let no= createNo(newno);
         this.department.no = no;
         /*生成编号*/
 
         this.openVPage(VDepartmentEdit,this.department);
     }
     showEditDepartment =(department:any)=>{//company:any=undefined 表示company参数不传值时用等号后面的值赋值,company?:any 表示company可传可不传
         this.department = department; 
         this.openVPage(VDepartmentEdit,this.department);
     }

     callcompany = async ():Promise<any> =>{
        this.callpager = new QueryPager(this.uqs.task.QueryCompany, 10, 30);//实例化分页查询操作对象
        this.callpager.setItemDeepObservable();//执行这个方法后可实现绑定了当前paper的View自动刷新显示
        await this.callpager.first({key:''});//执行第一次查询,前面需要加await,因为这是异步查询
        return this.vCall(VCallCompany);//openVPage可以传第二个参数,如果有传第二个参数,则对应view里面的open方法需要定义入参用于接收改参数,query的查询结果对应数组类型any[]
     }
     
     calldepartmen = async ():Promise<any> =>{
        this.callpager = new QueryPager(this.uqs.task.QueryDepartment, 10, 30);//实例化分页查询操作对象
        this.callpager.setItemDeepObservable();//执行这个方法后可实现绑定了当前paper的View自动刷新显示
        await this.callpager.first({key:''});//执行第一次查询,前面需要加await,因为这是异步查询
        return this.vCall(VCallDepartment);//openVPage可以传第二个参数,如果有传第二个参数,则对应view里面的open方法需要定义入参用于接收改参数,query的查询结果对应数组类型any[]
     }

     saveDepartmentItem = async (department:any):Promise<TuidSaveResult>=>{
        let {id} = this.department;
        let ret= await this.uqs.task.Department.save(id, department);//id传-1或0是显示表示新增,id>0显示的更新,id为undefined则先拿no查id,然后以id来进行更新,如果查不要id则新增
        if(ret.id>0)//ret.id为保存后返回的的基础信息id,id=0表示失败,id>0表示成功,id<0表示为做任何更改,ret.inid调用save方法是传入的原始id值,
        {
           let owcompany = await this.uqs.task.Company.load(department.company);
           let owdepartment=await this.uqs.task.Department.load(department.parent);
           department.companyno=owcompany.no;
           department.companyname=owcompany.name;
           department.parentno=owdepartment.no;
           department.parentname=owdepartment.name;

            if(id<0)//新增的            
            {   
                this.department.id= ret.id;
                let data = _.merge({}, this.department, department);//把参数2和参数3依次和参数1进行合并      
                this.pager.items.unshift(data);
            }
            else//修改
            {
                let index = this.pager.items.findIndex(v => v.id === id);
                if (index>=0) {
                    _.merge(this.pager.items[index], department);
                }
            }
        }

        return ret;
    }


    /********************************************************************************************************************/
    /***********************************************职员信息**************************************************************/
    /********************************************************************************************************************/
    /*职员信息*/

    staff: any;

    showStaffMember =async ()=>{
        this.pager=new QueryPager(this.uqs.task.QueryStaffMember, 10, 30);
        this.pager.setItemDeepObservable();
        this.pager.first({key:''});
        this.openVPage(VStaffMemberList);
    }

     private getemptyStaff=():Staff=>{
        return {id: -1, no: '', name: '', gender: 0, image: '', note:'', disabled:0, department:[]}
     }

     showNewStaff = async () => {
         this.staff=this.getemptyStaff();
         /*生成编号*/
         let newno= await this.uqs.task.StaffMember.no();
         let no= createNo(newno);
         this.staff.no = no;
         /*生成编号*/
 
         this.openVPage(VStaffMemberEdit,this.staff);
     }
     showEditStaff =(staff:any)=>{//company:any=undefined 表示company参数不传值时用等号后面的值赋值,company?:any 表示company可传可不传
         this.staff = staff; 
         this.openVPage(VStaffMemberEdit,this.staff);
     }

     saveStaffItem = async (staff:any):Promise<TuidSaveResult>=>{
        let {id} = this.staff;
        let ret= await this.uqs.task.StaffMember.save(id, staff);//id传-1或0是显示表示新增,id>0显示的更新,id为undefined则先拿no查id,然后以id来进行更新,如果查不要id则新增
        if(ret.id>0)//ret.id为保存后返回的的基础信息id,id=0表示失败,id>0表示成功,id<0表示为做任何更改,ret.inid调用save方法是传入的原始id值,
        {
            await this.uqs.task.SaveStaffDepartment.submit({
                arr1:[
                    {staff:1,department:1,level:1}
                ]
            });
            if(id<0)//新增的            
            {   
                this.staff.id= ret.id;
                let data = _.merge({}, this.staff, staff);//把参数2和参数3依次和参数1进行合并      
                this.pager.items.unshift(data);
            }
            else//修改
            {
                let index = this.pager.items.findIndex(v => v.id === id);
                if (index>=0) {
                    _.merge(this.pager.items[index], staff);
                }
            }
        }

        return ret;
    }


}