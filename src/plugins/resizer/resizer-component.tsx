import * as React from 'react';
import * as shallowEqual from 'shallowequal';
import { Draggable } from 'react-managed-draggable';
import { TableDescription, DataColumnDescriptor, ValueHeaderRow, HeadColumnDescriptor } from '../../table/model';
import { Sizes } from './model';

export interface ResizerProps {
    sizes: Sizes;
    onSizesChange: (sizes: Sizes) => void;
    tableElement: Element;
    tableDescription: TableDescription<any>;
}

export interface ResizerState {
    containerLeft: number | null;
    containerTop: number | null;
    tableLeft: number | null;
    tableTop: number | null;
    tableInnerTop: number | null;
    tableInnerLeft: number | null;
    tableInnerWidth: number | null;
    tableInnerHeight: number | null;
    draggingId: string | null;
    draggingOffset: number;
}

export class Resizer extends React.Component<ResizerProps, ResizerState> {
    state: ResizerState = {
        containerTop: null,
        containerLeft: null,
        tableTop: null,
        tableLeft: null,
        tableInnerTop: null,
        tableInnerLeft: null,
        tableInnerWidth: null,
        tableInnerHeight: null,
        draggingId: null,
        draggingOffset: 0
    };

    raf: number | undefined = undefined;

    container: HTMLDivElement | null = null;

    shouldComponentUpdate(nextProps: ResizerProps, nextState: ResizerState) {
        return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
    }

    componentDidMount() {
        this.raf = window.requestAnimationFrame(this.update);
    }

    componentWillUnmount() {
        if (this.raf !== undefined) {
            window.cancelAnimationFrame(this.raf);
        }
    }

    update = () => {
        if (this.container !== null) {
            const { top, left } = this.container.getBoundingClientRect();
            if (this.state.containerTop !== top || this.state.containerLeft !== left) {
                this.setState({ containerTop: top, containerLeft: left });
            }
        }
        const { top, left, width, height } = this.props.tableElement.getBoundingClientRect();
        if (this.state.tableLeft !== left || this.state.tableTop !== top) {
            this.setState({ tableTop: top, tableLeft: left });
        }
        if (this.state.tableInnerTop !== this.props.tableElement.clientTop || this.state.tableInnerLeft !== this.props.tableElement.clientLeft) {
            this.setState({ tableInnerTop: this.props.tableElement.clientTop, tableInnerLeft: this.props.tableElement.clientLeft });
        }
        if (this.state.tableInnerWidth !== this.props.tableElement.clientWidth || this.state.tableInnerHeight !== this.props.tableElement.clientHeight) {
            this.setState({ tableInnerWidth: this.props.tableElement.clientWidth, tableInnerHeight: this.props.tableElement.clientHeight });
        }
        this.raf = window.requestAnimationFrame(this.update);
    }

    getColumns(row: ValueHeaderRow<any>): (HeadColumnDescriptor | DataColumnDescriptor<any>)[] {
        return [{ type: 'head-column' }, ...row.columns];
    }

    getColumnId(column: HeadColumnDescriptor | DataColumnDescriptor<any>) {
        if (column.type === 'head-column') {
            return 'head-row-value-head-column';
        } else {
            return `head-row-value-${column.groupDescriptors.map((group) => `${group.groupId}-${group.groupIndex}`).join('-')}-${column.valueDescription.id}`;
        }
    }

    getColumnSizes(columns: (HeadColumnDescriptor | DataColumnDescriptor<any>)[]) {
        const fractions = columns.map((column) => {
            const id = this.getColumnId(column);
            if (this.props.sizes[id] !== undefined) {
                return this.props.sizes[id];
            } else {
                return 1 / columns.length;
            }
        });

        return fractions;
    }

    renderHandles() {
        if (this.state.containerTop !== null && this.state.containerLeft !== null && this.state.tableTop !== null && this.state.tableLeft !== null && this.state.tableInnerTop !== null && this.state.tableInnerLeft !== null && this.state.tableInnerWidth !== null && this.state.tableInnerHeight !== null) {
            const offsetTop = this.state.tableTop - this.state.containerTop + this.state.tableInnerTop;
            const offsetLeft = this.state.tableLeft - this.state.containerLeft + this.state.tableInnerLeft;

            const result: React.ReactNode[] = [];
            for (const row of this.props.tableDescription.headRows) {
                if (row.type === 'value-header-row') {
                    const columns = this.getColumns(row);
                    const sizes = this.getColumnSizes(columns);
                    console.log(sizes);
                    for (let i = 0, size = sizes[0]; i < columns.length - 1; size += sizes[i + 1], i++) {
                        const id = this.getColumnId(columns[i]);
                        result.push(
                            <Draggable
                                key={id}
                                style={{
                                    position: 'absolute',
                                    cursor: 'col-resize',
                                    top: offsetTop,
                                    left: offsetLeft + size * this.state.tableInnerWidth - 10 + (this.state.draggingId === id ? this.state.draggingOffset : 0),
                                    width: 20,
                                    height: this.state.tableInnerHeight
                                }}
                                onDragStart={() => this.setState({ draggingId: id })}
                                onDragMove={(event, payload) => this.setState({ draggingOffset: payload.current.x - payload.start.x })}
                                onDragEnd={(event, payload) => {
                                    if (this.state.tableInnerWidth) {
                                        const offset = payload.current.x - payload.start.x;
                                        const delta = offset / this.state.tableInnerWidth;
                                        const clamped = Math.min(sizes[i + 1], Math.max(-sizes[i], delta));
                                        // TODO: instead of clamp, rescale rest of table to fit changed size
                                        this.props.onSizesChange({
                                            ...this.props.sizes,
                                            [id]: sizes[i] + clamped,
                                            [this.getColumnId(columns[i + 1])]: sizes[i + 1] - clamped
                                        });
                                    }
                                    this.setState({ draggingId: null, draggingOffset: 0 });
                                }}
                            >
                                <div style={{ position: 'absolute', left: 9, width: 2, height: '100%', backgroundColor: 'blue' }} />
                            </Draggable>
                        );
                    }

                    return result;
                }
            }

            return result;
        }
    }

    render() {
        return <div ref={(ref) => this.container = ref} style={{ position: 'relative' }}>
            {this.renderHandles()}
        </div>;
    }
}