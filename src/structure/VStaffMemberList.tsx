import * as React from 'react';
import classNames from 'classnames';
import { Page, Image,VPage, ImageUploader, Form, ItemSchema, UiSchema, UiTextItem, ButtonWidget, UiButton, NumSchema, UiTextAreaItem, List, LMR, FA, SearchBox, ImageWidget } from 'tonva';
import { CStructure } from './CStructure';

const genderTexts = [
    {
        cn: undefined,
        text: '不确定'
    }, 
    {
        cn: 'text-success mx-2',
        text: '男'
    }, 
    {
        cn: 'text-danger mx-2',
        text: '女'
    }];

const vGender=(value:number):any=> genderTexts[value] || genderTexts[0];

export class VStaffMemberList extends VPage<CStructure>{
    async open(){
        this.openPage(this.page);
    }
    /*单个数据项输出界面元素*/
    private renderStaff=(staff:any, index:number) => {
        let {no,name,gender,image} = staff;//将department对象的no属性,name属性,companyname属性自动赋值给同名的变量,一种语法糖,类似于C#中Json对象与类的实例自动转换,通过名称自动匹配
        let gd=vGender(gender);

        //let left = <FA name="user" className={gdtype} fixWidth={true} size="lg" />;//列表左侧显示当地界面元素
        let left=<Image className="w-3c h-3c mr-2" src={image} altImage=":0-0164.jpg" />
        //let right = <span className={classNames("align-items-center", gd.cn)}>{gd.text}</span>;//列表右侧显示的界面元素
        let right = <FA name="user" className={classNames("align-items-center", gd.cn)} fixWidth={true} size="lg" />;//列表左侧显示当地界面元素
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
        this.controller.showNewStaff();
    }

    private onItemClick = (item:any) => {
        this.controller.showEditStaff(item);
    }

    private page =() =>{
        let header=<SearchBox label="职员" onSearch={this.onseach} className="w-100"/>
        let right=<button className="btn btn-success rounded align-self-center mr-2" onClick={this.onAddClick}>增加</button>
        return <Page header={header} right={right} headerClassName="bg-primary align-middle" onScrollBottom={this.onScrollBottom}>
            {/*输出列表,其中属性items为数据集合,属性item为遍历数据集合时调用的输出界面元素的方法,
            该方法两个参数,第一个参数就是遍历数据集合时当前数据项,第二个参数为数据项在集合中的索引*/}
            <List items={this.controller.pager} item={{render: this.renderStaff, onClick: this.onItemClick} }/> 
        </Page>

    }
} 