import * as React from 'react';
import { TableConfigurationBuilder, TableConfiguration } from '../../../table/configuration';
import { TableHeadGroupCell } from './table-head-group-cell';
import { TableHeadValueCell } from './table-head-value-cell';
import { provideProps } from '../../../util/provide-props';
import { TableContainer, TableContainerProps, TableContainerProvidedProps } from './table-container';
import { TableBodyCell } from './table-body-cell';
import { TableBodyRows, TableBodyRowsProps } from './table-body-rows';

// TODO: keep all existing functionality of builder, or drop it and make one monolithic component for now, and then perhaps custom .with calls in future

export interface VirtualScrollingTableConfiguration<D> {
    tableContainerComponent: React.ComponentClass<Pick<TableContainerProps<D>, Exclude<keyof TableContainerProps<D>, TableContainerProvidedProps>>>;
}

export interface VirtualScrollingTableConfigurationBuilder<D> extends Pick<TableConfigurationBuilder<D>, Exclude<keyof TableConfigurationBuilder<D>, 'tableContainerComponent' | 'tableBodyRowsComponent' | 'withTableContainerComponent' | 'withTableBodyRowsComponent' | 'build'>> {
    tableContainerComponent: React.ComponentClass<TableContainerProps<D>>;
    tableBodyRowsComponent: React.ComponentType<TableBodyRowsProps<D>>;
    withTableContainerComponent<C>(this: C, tableContainerComponent: React.ComponentType<TableContainerProps<D>>): C;
    withTableBodyRowsComponent<C>(this: C, tableBodyRowsComponent: React.ComponentType<TableBodyRowsProps<D>>): C;
    build(): VirtualScrollingTableConfiguration<D>;
}

export const virtualGrid = <D>() => (tableConfigurationBuilder: TableConfigurationBuilder<D>): VirtualScrollingTableConfigurationBuilder<D> => {
    // tableConfigurationBuilder.withTableBodyCellComponent(tableBodyCellFactory(initialState, addListener));
    // tableConfigurationBuilder.withTableHeadRowComponent(React.Fragment);
    // tableConfigurationBuilder.withTableHeadRowsComponent(TableHeadRows);
    // tableConfigurationBuilder.withTableHeadComponent(TableHead);
    // tableConfigurationBuilder.withTableBodyComponent(TableBody);
    // tableConfigurationBuilder.withTableBodyRowsComponent(tableBodyRowsFactory(initialState, addListener));
    // tableConfigurationBuilder.withTableBodyRowComponent(React.Fragment);
    // tableConfigurationBuilder.withTableHeadGroupCellComponent(TableHeadGroupCell);
    // tableConfigurationBuilder.withTableHeadValueCellComponent(TableHeadValueCell);
    // tableConfigurationBuilder.withTableContainerComponent(tableContainerFactory(initialState, addListener, pushState));

    const builder: VirtualScrollingTableConfigurationBuilder<D> = {
        ...tableConfigurationBuilder,
        tableContainerComponent: TableContainer,
        tableHeadRowComponent: React.Fragment,
        tableHeadGroupCellComponent: TableHeadGroupCell,
        tableHeadValueCellComponent: TableHeadValueCell,
        tableBodyRowsComponent: TableBodyRows,
        tableBodyRowComponent: React.Fragment,
        tableBodyCellComponent: TableBodyCell,
        withTableContainerComponent(tableContainerComponent: React.ComponentClass<TableContainerProps<D>>) {
            builder.tableContainerComponent = tableContainerComponent;
            return this;
        },
        withTableBodyRowsComponent(tableBodyRowsComponent: React.ComponentType<TableBodyRowsProps<D>>) {
            builder.tableBodyRowsComponent = tableBodyRowsComponent;
            return this;
        },
        build() {
            return {
                tableContainerComponent: provideProps(builder.tableContainerComponent, {
                    tableHeadRowsComponent: provideProps(builder.tableHeadRowsComponent, {
                        tableHeadGroupRowComponent: provideProps(builder.tableHeadGroupRowComponent, {
                            tableHeadRowComponent: builder.tableHeadRowComponent,
                            tableHeadGroupCellComponent: builder.tableHeadGroupCellComponent
                        }),
                        tableHeadValueRowComponent: provideProps(builder.tableHeadValueRowComponent, {
                            tableHeadRowComponent: builder.tableHeadRowComponent,
                            tableHeadValueCellComponent: builder.tableHeadValueCellComponent
                        })
                    }),
                    tableBodyRowsComponent: provideProps(builder.tableBodyRowsComponent, {
                        tableBodyRowComponent: builder.tableBodyRowComponent,
                        tableBodyCellComponent: builder.tableBodyCellComponent
                    })
                })
            };
        }
    };

    return builder;
};