import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Table,Badge,Button,Progress } from 'antd';
import schema from '../../../modules/trades/schema';
import {toNumber} from 'Loopring/common/formatter';
const uiFormatter = window.uiFormatter
const fm = window.uiFormatter.TokenFormatter

function ListBlock(props) {
  const {LIST, actions, className, style} = props;
  const {
      items=[],
      loading,
      page={}
  } = LIST
  const {dispatch} = props;
  const showModal = (payload={})=>{
    dispatch({
      type:'modals/modalChange',
      payload:{
        ...payload,
        visible:true,
      },
    })
  }
  const handleCopy = (value, e) => {
    e.preventDefault();
    e.clipboardData.setData("text", value);
  };
  const renders = {
      ringHash:(value,item,index)=>(
        <a className="text-truncate d-block color-blue-500 text-left" onCopy={handleCopy.bind(this, value)} style={{maxWidth: '150px'}}
            onClick={showModal.bind(this,{id:'trade/detail',item})}>
            <Progress className="mr5" type="circle" percent={100} width={36} format={percent => `#${item.fillIndex+1}`}  />
            <span>{uiFormatter.getShortAddress(value)}</span>

        </a>
      ),
      side:(value,item,index)=>{
        if (item.side === 'sell') {
          return <div className="color-green-500">Sell</div>
        }
        if (item.side === 'buy') {
          return <div className="color-red-500">Buy</div>
        }
      },
      amount:(value,item,index)=>{
        const fmS = item.side === 'buy'? new fm({symbol:item.tokenB}) : new fm({symbol:item.tokenS});
        const amount = item.side === 'buy'? fmS.getAmount(item.amountB) : fmS.getAmount(item.amountS);
        return <span> {amount}  {item.side === 'buy'? item.tokenB : item.tokenS} </span>
      },
      price:(value,item,index)=>{
        // const fmB = new fm({symbol:item.tokenB})
        // const fmS = new fm({symbol:item.tokenS})
        // const amountS = fmS.getAmount(item.amountS)
        // const amountB = fmB.getAmount(item.amountB)
        return <span> {(item.side === 'buy' ? (item.amountS/item.amountB) :(item.amountB/item.amountS) ).toFixed(5)} </span>
      },
      total:(value,item,index)=>{
        const fmS = item.side === 'buy'? new fm({symbol:item.tokenS}) : new fm({symbol:item.tokenB});
        const amount = item.side === 'buy'? fmS.getAmount(item.amountS) : fmS.getAmount(item.amountB);
        return <span> {amount}  {item.side === 'buy' ? item.tokenS : item.tokenB} </span>
      },
      lrcFee:(value,item,index)=>{
        const fmLrc = new fm({symbol:'LRC'})
        return <span> {fmLrc.getAmount(item.lrcFee)}  {'LRC'} </span>
      },
      time:(value,item,index)=>{
        return uiFormatter.getFormatTime(toNumber(item.createTime)* 1e3)
      },
  }
  const actionRender = (value,item,index)=>{
    return <Button>Cancel</Button>
  }
  let columns = schema.map(field=>{
    return {
        title:field.title,
        dataIndex:field.name,
        render:renders[field.name],
        className:'text-nowrap',
        width:`${100/schema.length}%`,
    }
  })
  const tableChange = (pagination, filters, sorter)=>{
    // sorder {field,order}
    // filters {field,field}
    const sort = {
      [sorter.field]:sorter.order // TODO
    }
    actions.queryChange({
      sort,filters // TODO
    })
  }
  const tableProps={
    dataSource:items,
    columns:columns,
    pagination:false,
    loading:loading,
    scroll:{x:true},
    onChange:tableChange,
    bordered:false,
  }
  return (
    <div className={className} style={{...style}}>
      <Table {...tableProps}/>
    </div>
  )
}

ListBlock.propTypes = {
};

export default ListBlock