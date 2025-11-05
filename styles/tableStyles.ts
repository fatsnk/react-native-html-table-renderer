import { StyleSheet } from 'react-native';

export const tableStyles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thead: {
    backgroundColor: '#f5f5f533',
  },
  tbody: {},
  tr: {
    flexDirection: 'row',
  },
  th: {
    padding: 8,
    fontWeight: 'bold',
    //backgroundColor: 'rgba(240, 240, 240, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    flexShrink: 0, // 防止单元格内容被压缩
  },
  td: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    flexShrink: 0, // 防止单元格内容被压缩
  },
});