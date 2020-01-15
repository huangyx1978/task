import * as React from 'react';
import { nav, Image, VPage, Prop, IconText, FA, PropGrid, LMR, Page,List } from 'tonva';
import {CStructure} from './CStructure'

const cli="list-group-item cursor-pointer";
const Li = (caption:string,onClick:()=>void,index:number) => <li className={cli} onClick={onClick} key={index}>{caption}</li>;
interface InfoItem{
    caption:string,
    onClick:()=>void
}

export class Vtest extends VPage<CStructure>{
   async open(param?: any){

    }

    /*单个数据项输出界面元素*/
    private renderCompany=(company:any, index:number) => {
        //let {a1:no, a2:name} = company;//使用冒号可以进行变量更名
        let {no,name,telephone} = company;//将company对象的no属性,name属性,telephone属性自动赋值给同名的变量,一种语法糖,类似于C#中Json对象与类的实例自动转换,通过名称自动匹配
        let left = <FA name="bank" className="text-success mx-2" fixWidth={true} size="lg" />;//列表左侧显示当地界面元素
        let right = <span className="align-items-center">{telephone}</span>;//列表右侧显示的界面元素
        return <LMR className="px-3 py-2 align-items-center cursor-pointer" left={left} right={right} ><b className="h6">{name}</b></LMR>//输出包含左中右三个分区的列表项
    }

    /*页面滚动到底部时触发的操作*/
    private onScrollBottom = () => {
        this.controller.pagertest.more();//执行下一页的查询
    }

    private onItemClick = (item:any) => {
        alert("点击了itme");
    }

    render(){
        return <Page header="组织架构" headerClassName="bg-info" onScrollBottom={this.onScrollBottom}>
            {/*输出列表,其中属性items为数据集合,属性item为遍历数据集合时调用的输出界面元素的方法,
            该方法两个参数,第一个参数就是遍历数据集合时当前数据项,第二个参数为数据项在集合中的索引*/}
            <List items={this.controller.pagertest} item={{render: this.renderCompany, onClick: this.onItemClick} }/> 
        </Page>
    }
    
}