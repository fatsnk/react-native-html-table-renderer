import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, ViewStyle, Dimensions } from 'react-native';
import { TDefaultRenderer, TDefaultRendererProps } from 'react-native-render-html';
import { tableStyles } from '../../styles/tableStyles';

interface CustomRendererProps extends TDefaultRendererProps<any> {
  TDefaultRenderer: React.ComponentType<TDefaultRendererProps<any>>;
}

// 递归地从 tnode 中提取所有文本内容
const extractTextFromTNode = (tnode: any): string => {
  if (!tnode) {
    return '';
  }
  if (tnode.type === 'text') {
    return tnode.data || '';
  }
  if (tnode.children && tnode.children.length > 0) {
    return tnode.children.map(extractTextFromTNode).join('');
  }
  return '';
};

const TableRenderer: React.FC<CustomRendererProps> = ({ TDefaultRenderer, tnode, ...props }) => {
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  useEffect(() => {
    const calculateColumnWidths = () => {
      const screenWidth = Dimensions.get('window').width;
      const rows = tnode.children.flatMap((child: any) =>
        child.tagName === 'thead' || child.tagName === 'tbody' ? child.children : []
      ).filter((row: any) => row.tagName === 'tr');

      if (rows.length === 0) {
        return;
      }

      const numColumns = Math.max(0, ...rows.map((row: any) => row.children.length));
      const maxTableWidth = screenWidth * 0.8; // 表格最大宽度为屏幕的80%
      const minColWidth = 50; // 设置一个最小列宽，例如50
      // 根据列数决定最大列宽
      const maxColWidth = numColumns > 1 ? maxTableWidth * 0.5 : maxTableWidth;

      const contentWidths: number[] = Array(numColumns).fill(0);
      rows.forEach((row: any) => {
        row.children.forEach((cell: any, cellIndex: number) => {
          const textContent = extractTextFromTNode(cell);
          // 区分中英文计算宽度，中文算2个字符，英文算1个字符
          const chineseChars = textContent.match(/[\u4e00-\u9fa5]/g) || [];
          const otherChars = textContent.replace(/[\u4e00-\u9fa5]/g, '');
          const calculatedLength = chineseChars.length * 2 + otherChars.length;
          
          const contentLength = calculatedLength * 7 + 32; // 调整了字体大小和内边距的估算
          
          // 应用最大列宽限制
          const limitedContentLength = Math.min(contentLength, maxColWidth);

          if (limitedContentLength > contentWidths[cellIndex]) {
            contentWidths[cellIndex] = limitedContentLength;
          }
        });
      });

      // 首先确保所有列都至少有最小宽度
      let adjustedContentWidths = contentWidths.map(width => Math.max(width, minColWidth));
      const adjustedTotalWidth = adjustedContentWidths.reduce((sum, width) => sum + width, 0);

      let finalColumnWidths: number[];

      if (adjustedTotalWidth < maxTableWidth) {
        // 如果调整后的总宽度仍小于最大表格宽度，按比例拉伸以填满
        const ratio = maxTableWidth / adjustedTotalWidth;
        finalColumnWidths = adjustedContentWidths.map(width => width * ratio);
      } else {
        // 如果超出（或等于），就直接使用调整后的宽度，允许横向滚动
        finalColumnWidths = adjustedContentWidths;
      }

      setColumnWidths(finalColumnWidths);
    };

    calculateColumnWidths();
  }, [tnode]);

  const renderCell = (cell: any, cellIndex: number, isHeader: boolean) => {
    const cellStyle: ViewStyle[] = [
      isHeader ? tableStyles.th : tableStyles.td,
      { width: columnWidths[cellIndex] || undefined },
    ];

    return (
      <View key={cellIndex} style={cellStyle}>
        {cell.children.map((child: any, index: number) => (
          <TDefaultRenderer
            key={index}
            tnode={child}
            {...props}
          />
        ))}
      </View>
    );
  };

  const renderRow = (row: any, rowIndex: number) => (
    <View key={rowIndex} style={tableStyles.tr}>
      {row.children.map((cell: any, cellIndex: number) =>
        renderCell(cell, cellIndex, cell.tagName === 'th')
      )}
    </View>
  );

  const renderTableBody = (body: any) => {
    return body.children
      .filter((row: any) => row.tagName === 'tr')
      .map(renderRow);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={tableStyles.table}>
        {tnode.children.map((child: any, index: number) => {
          if (child.tagName === 'thead' || child.tagName === 'tbody') {
            return (
              <View key={index} style={child.tagName === 'thead' ? tableStyles.thead : tableStyles.tbody}>
                {renderTableBody(child)}
              </View>
            );
          }
          return null;
        })}
      </View>
    </ScrollView>
  );
};

export { TableRenderer };