import React from 'react';
import { Avatar,Icon,Button,Card,Modal } from 'antd';
import * as fm from '../../../common/Loopring/common/formatter'
import Currency from '../../../modules/settings/CurrencyContainer'
import {accDiv, accMul} from '../../../common/Loopring/common/math'
import {notifyTransactionSubmitted} from 'Loopring/relay/utils'
import intl from 'react-intl-universal';
import CoinIcon from '../../common/CoinIcon'

let Preview = ({
  modal, account
  }) => {
  const {tx,extraData} = modal
  const handelSubmit = ()=>{
    modal.showLoading({id:'token/transfer/preview'})
    extraData.pageFrom = "Transfer"
    let result = {...tx, extraData}
    // To test Ledger
    // tx.chainId = 1
    window.STORAGE.wallet.getNonce(account.address).then(nonce => {
      tx.nonce = fm.toHex(nonce)
      if(window.WALLET_UNLOCK_TYPE === 'Ledger') {
        Modal.info({
          title: intl.get('token.to_confirm_title'),
          content: intl.get('token.to_confirm_ledger_content'),
        });
      }
      return window.WALLET.sendTransaction(tx)
    }).then(res=>{
      if(res.error) {
        result = {...result, error:res.error.message}
      } else {
        window.STORAGE.transactions.addTx({hash: res.result, owner: account.address})
        window.STORAGE.wallet.setWallet({address:window.WALLET.getAddress(),nonce:tx.nonce})
        notifyTransactionSubmitted(res.result);
      }
      extraData.txHash = res.result
      modal.hideModal({id:'token/transfer/preview'})
      modal.showModal({id:'token/transfer/result', result})
      modal.hideLoading({id:'token/transfer/preview'})
    }).catch(e=>{
      console.error(e)
      result = {...result, error:e.message}
      modal.hideModal({id:'token/transfer/preview'})
      modal.showModal({id:'token/transfer/result', result})
      modal.hideLoading({id:'token/transfer/preview'})
    })
  }

  const handelCancel = ()=>{
    modal.hideModal({id:'token/transfer/preview'})
  }

  const MetaItem = (props)=>{
    const {label,value} = props
    return (
      <div className="row pt10 pb10 zb-b-b">
        <div className="col">
          <div className="fs14 color-grey-600">{label}</div>
        </div>
        <div className="col-auto">
          <div className="fs14 color-grey-900">{value}</div>
        </div>
      </div>
    )
  }
  const ArrowDivider = (
      <div className="row no-gutters align-items-center">
        <div className="col">
          <hr className="w-100 bg-grey-900"/>
        </div>
        <div className="col-auto">
          <Icon type="right" className="color-grey-900" style={{marginLeft:'-9px'}}></Icon>
        </div>
      </div>
  )
  const priceValue = (
    <span className="fs12">
      ≈
      <Currency />
      {accMul(extraData.amount, extraData.price).toFixed(2)}
    </span>
  )
  return (
      <Card title={intl.get('token.transfer_preview_title')}>

        <div className="row flex-nowrap pb30">
          <div className="col">
            <div className="text-center">
              <CoinIcon size="60" symbol={extraData.tokenSymbol} />
              <div className="fs20 color-grey-900">{`${extraData.amount} ${extraData.tokenSymbol} `}{priceValue}</div>
            </div>
          </div>
        </div>
        {
          false &&
          <div className="row flex-nowrap zb-b-b">
            <div className="col-auto">
              <div className="text-center">
                <Avatar size="large" className="bg-blue-500" src="">U</Avatar>
              </div>
            </div>
            <div className="col">
              <div className="text-center">
                {ArrowDivider}
              </div>
            </div>
            <div className="col-auto">
              <div className="text-center">
                <Avatar size="large" className="bg-blue-500" src="">U</Avatar>
              </div>
            </div>
          </div>
        }
        <MetaItem label={intl.get('token.from')} value={extraData.from} />
        <MetaItem label={intl.get('token.to')} value={tx.to} />
        <MetaItem label={intl.get('token.gas')} value={
          <div className="mr15">
            <div className="row justify-content-end">{`${fm.toBig(tx.gasPrice.toString()).times(tx.gasLimit).times('1e-18').toString(10)}  ETH`}</div>
            <div className="row justify-content-end fs10 color-dark-text-disabled">{`≈ Gas(${fm.toNumber(tx.gasLimit).toString(10)}) * Gas Price(${fm.toNumber(tx.gasPrice)/(1e9).toString(10)} gwei)`}</div>
          </div>
        }/>
        <div className="row pt40">
          <div className="col pl0">
            <Button onClick={handelCancel} className="d-block w-100" type="" size="large">{intl.get('token.transfer_cancel')}</Button>
          </div>
          <div className="col pr0">
            <Button loading={modal.loading} onClick={handelSubmit} className="d-block w-100" type="primary" size="large">{intl.get('token.transfer_send')}</Button>
          </div>
        </div>
      </Card>
  );
};


export default Preview;


