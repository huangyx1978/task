import * as React from 'react';
import { Page, VPage, ImageUploader, Form, ItemSchema, UiSchema, UiTextItem, ButtonWidget, UiButton, NumSchema, UiTextAreaItem, List, LMR, FA, SearchBox } from 'tonva';
import { CStructure } from './CStructure';

/*
const Card=(company:CompnaryItem,index:number,onClick:()=>void)=><div className="card" key={index}>
<div className="card-header cursor-pointer" onClick={onClick}>
    {company.name}
</div>
<div className="card-body">
    <ul className="list-group W-100" >
        <li className="list-group-item">
            {company.address}
        </li>
        <li className="list-group-item">
            {company.telephone}
        </li>
    </ul>
</div>
</div>

interface CompnaryItem{
    no:string,
    name:string,
    address:string,
    telephone:string
}

private arr:CompnaryItem[]=[
    {no:"0001",name:"江苏捷科软件有限公司",address:"江苏省南通市青年中路136号南通科院创业园2楼东区",telephone:"0513-85299486,85299487"},
    {no:"0002",name:"北京新天地科技有限公司",address:"北京朝阳区西寺胡同291号",telephone:"010-93883291,93883292"},
    {no:"0003",name:"上海安利来智能科技有限公司",address:"上海黄浦区人民路481号",telephone:"021-88893222"}
];


private page =() =>{

    return <Page header="公司机构" headerClassName="bg-primary">
        {this.arr.map((v,index)=>{
            return Card(v,index, ()=>this.controller.showCompnayEdit(v));
        })}
    </Page>

}
*/

export class VCompanyList extends VPage<CStructure>{
    private companylist:any[];
    /*该方法必需实现,类似老平台的initview方法,平台载入View时会调用*/
    async open(companylist?:any[]){
        this.companylist = companylist;//接收传入的参数并赋值给临时变量
        this.openPage(this.page);
    }
    /*单个数据项输出界面元素*/
    private renderCompany=(company:any, index:number) => {
        //let {a1:no, a2:name} = company;//使用冒号可以进行变量更名
        let {no,name,telephone} = company;//将company对象的no属性,name属性,telephone属性自动赋值给同名的变量,一种语法糖,类似于C#中Json对象与类的实例自动转换,通过名称自动匹配
        let left = <FA name="bank" className="text-success mr-2" fixWidth={true} size="lg" />;//列表左侧显示当地界面元素
        let right = <span className="align-items-center">{telephone}</span>;//列表右侧显示的界面元素
        return <LMR className="px-3 py-2 align-items-center cursor-pointer" left={left} right={right} ><b className="h6">{name}</b></LMR>//输出包含左中右三个分区的列表项
    }

    /*页面滚动到底部时触发的操作*/
    private onScrollBottom = () => {
       this.controller.pager.more();//执行下一页的查询
    }

     private onseach= async (seachkey:string)=>{
       await this.controller.pager.first({key:seachkey});//将参数包装成一个Json对象的属性
    }

    private onAddClick=() =>{
        this.controller.showNewCompany();
    }

    private onItemClick = (item:any) => {
        this.controller.showEditCompnay(item);
    }

    private page =() =>{
        let header=<SearchBox label="公司机构" onSearch={this.onseach} className="w-100"/>
        let right=<button className="btn btn-success rounded align-self-center mr-2" onClick={this.onAddClick}>增加</button>
        //let footer=<div>公司机构</div>
        return <Page header={header} right={right} headerClassName="bg-primary align-middle" onScrollBottom={this.onScrollBottom}>
            {/*输出列表,其中属性items为数据集合,属性item为遍历数据集合时调用的输出界面元素的方法,
            该方法两个参数,第一个参数就是遍历数据集合时当前数据项,第二个参数为数据项在集合中的索引*/}
            <List items={this.controller.pager} item={{render: this.renderCompany, onClick: this.onItemClick} }/> 
        </Page>

    }


} 