import { CUqBase } from "tonvaApp";
import _ from 'lodash';
import { VHyx } from "./VHyx";
import {VCompanyList} from './VCompanyList';
import {VDepartMentList} from './VDepartMentList';
import {VStaffMemberList} from './VStaffMemberList';
import {VProductList} from './VProductList';
import {VCustomerList} from './VCustomerList';
import { VCompanyEdit } from "./VCompanyEdit";
import { QueryPager } from "tonva";
import { TuidSaveResult } from "tonva/dist/uq/tuid/tuid";
import { promises } from "dns";
import { createNo } from "tool/tools";

interface CompanyItem{
    id:number,
    no:string,
    name:string,
    seachcode:string,
    abbreviation:string,
    address:string,
    telephone:string,
    note:string
}

/*所有的交互操作都放在该Control中*/
export class CHyx extends CUqBase{
    company: any;
    pager: QueryPager<any>;//定义全局的支持分页查询的操作对象,在此定义的全局对象,在后面的View里都能通过this.controller来调用
    /*必需的定义*/
    protected async internalStart(){

    }
    
    tab = () =>this.renderView(VHyx);//必需的定义

    /*公司机构*/
    /*打开公司机构列表,增加async表示是异步执行*/
    showCompany =async ()=>{
        //let ret=await  this.uqs.task.Company.search('',0,10);//执行平台自动生成的基础信息查询
        this.pager = new QueryPager(this.uqs.task.QueryCompany, 10, 30);//实例化分页查询操作对象
        this.pager.setItemDeepObservable();
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
    saveCompnayItem = async (company:any):Promise<TuidSaveResult>=>{
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

    /*部门信息*/
    showDepartment =async ()=>{
        this.openVPage(VDepartMentList);
    }

    showStaffMember =async ()=>{
        this.openVPage(VStaffMemberList);
    }

    showProduct =async ()=>{
        this.openVPage(VProductList);
    }

    showCustomer =async ()=>{
        this.openVPage(VCustomerList);
    }




}