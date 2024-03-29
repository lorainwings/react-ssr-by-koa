//src/client/pages/list/index.js
//index 组件

import React from 'react';
import {Link} from 'react-router-dom';

import tempData from './data';
import { Helmet } from 'react-helmet';

//组件
export default class Index extends React.Component {
    constructor(props) {
        super(props);        
        const initData = props.initialData || {};
        this.state={
            page:initData.page,
            fetchData:initData.fetchData
        }    
    }

    static async  getInitialProps() {
        console.log('fetch data');
        //模拟数据请求方法
        const fetchData=()=>{
            return new Promise(resolve=>{
                setTimeout(() => {
                    resolve({
                        code:0,
                        data: tempData
                    })
                }, 100);
            })
        }

        let res = await fetchData();

        return {
            fetchData:res,
            page:{
                tdk:{
                    title:'列表页 - react ssr',
                    keywords:'前端技术江湖',
                    description:'关键词'
                }
            }
        };
    }

    componentDidMount(){
        if(!this.state.fetchData){
            //如果没有数据，则进行数据请求
            Index.getInitialProps().then(res=>{
                this.setState({
                    fetchData:res.fetchData||[],
                    page:res.page
                });
                
            })
        }
    }

    render() {
        //渲染数据

        const {code,data}=this.state.fetchData||{};
        const {tdk={}} = this.state.page || {};
        
        return <div>

        <Helmet>
                <title>{tdk.title}</title>
                <meta name="description" content={tdk.description}/>
                <meta name="keywords" content={tdk.keywords}/>
        </Helmet>

        {data && data.map((item,index)=>{
            return <div key={index}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
            </div>
        })}
        {!data&&<div>暂无数据</div>}
        </div>
    }
}