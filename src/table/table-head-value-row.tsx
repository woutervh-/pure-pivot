import * as React from 'react';
import { TableHeadValueCellProps } from './table-head-value-cell';
import { ValueHeaderRow, TableDescription } from './model';

export interface TableHeadValueRowProps<D> {
    row: ValueHeaderRow<D>;
    tableDescription: TableDescription<D>;
    tableHeadRowComponent: React.ReactType;
    tableHeadValueCellComponent: React.ComponentType<TableHeadValueCellProps<D>>;
}

export type TableHeadValueRowProvidedProps = 'tableHeadRowComponent' | 'tableHeadValueCellComponent';

export class TableHeadValueRow<D> extends React.Component<TableHeadValueRowProps<D>, never> {
    render() {
        return <this.props.tableHeadRowComponent>
            <this.props.tableHeadValueCellComponent
                id="head-row-value-head-column"
                scope="row"
                colStart={0}
                row={this.props.row}
                column={{ type: 'head-column' }}
                tableDescription={this.props.tableDescription}
            >
                Values
            </this.props.tableHeadValueCellComponent>
            {this.props.row.columns.map((column, index) => {
                const id = `head-row-value-${column.groupDescriptors.map((group) => `${group.groupId}-${group.groupIndex}`).join('-')}-${column.valueDescription.id}`;
                return <this.props.tableHeadValueCellComponent
                    key={id}
                    id={id}
                    scope="col"
                    colStart={1 + index}
                    row={this.props.row}
                    column={column}
                    tableDescription={this.props.tableDescription}
                >
                    {column.valueDescription.label}
                </this.props.tableHeadValueCellComponent>;
            })}
        </this.props.tableHeadRowComponent>;
    }
}