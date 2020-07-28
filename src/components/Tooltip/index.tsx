import React, { useCallback } from 'react';
import { Chart } from '@antv/g2/lib/chart';
import _isFunction from '@antv/util/lib/is-function';
import _Tooltip from '@antv/g2/lib/chart/controller/tooltip';
import { TooltipCfg } from '@antv/g2/lib/interface';
import { registerComponentController } from '../../core';
import useChartView from '../../hooks/useChartView';
import ReactTooltip from './ReactTooltip';
import './actions';

registerComponentController('tooltip', _Tooltip);

const isReactTooltip = (props) => {
  const { visible = true, children } = props;
  return visible && _isFunction(children);
}

export interface ITooltip extends TooltipCfg, React.ComponentProps<any> {
  /** 图例是否可见 */
  visible?: boolean;
  /** 自定义Tooltip */
  children?: (title?: string, items?: any[], x?: number, y?: number) => {};
  [key: string]: any;
  /** 触发事件条件 */
  triggerOn?: 'hover' | 'click';
  /** Tooltip显示时 */
  onShow?: (e?: ITooltipEvent, chart?: Chart) => void;
  /** Tooltip改变时 */
  onChange?: (e?: ITooltipEvent, chart?: Chart) => void;
  /** Tooltip隐藏时 */
  onHide?: (e?: ITooltipEvent, chart?: Chart) => void;
}

const TooltipNormal: React.FC<ITooltip> = (props) => {
  const { visible = true, children, ...options } = props;
  const chartView = useChartView();
  if (visible === true) {
    chartView.tooltip({ showMarkers: false, ...options });
  } else {
    chartView.tooltip(false);
  }
  return null;
}

export interface ITooltipEvent {
  items: any[],
  title: string,
  x: number,
  y: number,
}

export default function Tooltip(props: ITooltip) {
  const { children, triggerOn, onShow, onChange, onHide, lock, ...options } = props;
  const chartView = useChartView();
  chartView.removeInteraction('tooltip');
  chartView.removeInteraction('tooltip-click');

  if (lock) {
    // hover的时候触发，但是点击的时候锁定位置
    chartView.interaction(`tooltip-lock`);
  } else if (triggerOn === 'click') {
    // 只有click的时候才会出现tooltip，hover 无效
    chartView.interaction(`tooltip-click`);
  } else {
    // click不会有任何动作，只有hover的时候跟随
    chartView.interaction(`tooltip`);
  }

  const showFnc = useCallback((ITooltipEvent) => {
    if (_isFunction(onShow)) {
      onShow(ITooltipEvent, chartView);
    }
  }, []);

  const changeFnc =  useCallback((ITooltipEvent) => {
    if (_isFunction(onChange)) {
      onChange(ITooltipEvent, chartView);
    }
  }, []);

  const hideFnc = useCallback((ITooltipEvent) => {
    if (_isFunction(onHide)) {
      onHide(ITooltipEvent, chartView);
    }
  }, []);

  chartView.off('tooltip:show', showFnc);
  chartView.on('tooltip:show', showFnc);

  chartView.off('tooltip:change', changeFnc);
  chartView.on('tooltip:change', changeFnc);

  chartView.off('tooltip:hide', hideFnc);
  chartView.on('tooltip:hide', hideFnc)

  return isReactTooltip(props) ? <ReactTooltip {...options} >{children}</ReactTooltip> : <TooltipNormal {...props} />;
}

Tooltip.defaultProps = {
  showMarkers: false,
  triggerOn: 'hover',
}
