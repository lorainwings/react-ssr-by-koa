//高阶组件 用于提取重复逻辑

import React from 'react';

let _this = null;

const popStateCallback = ()=> {
    // 使用popStateFn保存函数防止addEventListener重复注册
    if (_this && _this.getInitialProps) {
        console.log('popStateFn');
        _this.getInitialProps();
    }
};

export default (SourceComponent)=>{
    return class HoComponent extends React.Component {
        constructor(props) {
            super(props);

            this.state={
                initialData:{},
                canClientFetch:false//浏览器端是否需要请求数据
            }
        }
        //用于服务端调用
        static async getInitialProps(props){
            return SourceComponent.getInitialProps ? await SourceComponent.getInitialProps(props):{};
        }

        //用于封装处理
        async getInitialProps(){
            // ssr首次进入页面以及csr/ssr切换路由时才调用组件的getInitialProps方法
            const props = this.props;
            const res =  SourceComponent.getInitialProps ? await SourceComponent.getInitialProps(props) : {};
            this.setState({
                initialData: res,
                canClientFetch: true
            });

            console.log('getInitialProps');
            let { tdk } = res.page;
            if (tdk) {
                document.title = tdk.title;
            }
        }
        
        async componentDidMount() {
            
            _this = this; // 修正_this指向，保证_this指向当前渲染的页面组件
            //注册事件，用于在页面回退的时候触发
            window.addEventListener('popstate', popStateCallback);

            const canClientFetch = this.props.history && this.props.history.action === 'PUSH';//路由跳转的时候可以异步请求数据
            console.log('canClientFetch', canClientFetch);
            if (canClientFetch) {
                await this.getInitialProps();
            }
        }

        render() {
            // 只有在首次进入页面需要将window.__INITIAL_DATA__作为props，路由切换时不需要

            const props = {
                initialData:{},
               ...this.props
            };


            if(__SERVER__){
                //服务端渲染
                props.initialData = this.props.staticContext.initialData||{};                
            }else{
                //客户端渲染
                if (this.state.canClientFetch) {//需要异步请求数据
                    props.initialData = this.state.initialData||{};
                } else {
                    props.initialData = window.__INITIAL_DATA__;

                    window.__INITIAL_DATA__={};//使用过后清除数据,否则其他页面会使用
                }
            }
         
            return <SourceComponent  {...props}></SourceComponent>
        }
    }
}