const express = require('express');
const router = express.Router();
const { Standard, Node } = require('mindmap-layouts');

// 深度 → 原始尺寸
const RAW_SIZES = [
  { w: 380, h: 200 },
  { w: 240, h: 160 },
  { w: 200, h: 130 },
];
function rawSize(d) {
  if (d < RAW_SIZES.length) return RAW_SIZES[d];
  return { w: 170, h: 110 };
}
function hgap(d) { return d <= 1 ? 80 : 50; }
function vgap(d) { return d <= 1 ? 24 : 16; }

// 将前端 JSON 树转为 mindmap-layouts 的 Node 树
function toLayoutNode(json, options) {
  const data = { ...json, isRoot: json.depth === 0 };
  const node = new Node(data, options);
  if (json.children && json.children.length) {
    json.children.forEach(c => {
      const cn = toLayoutNode(c, options);
      cn.parent = node;
      node.children.push(cn);
    });
  }
  return node;
}

router.post('/', (req, res) => {
  try {
    const { root: jsonRoot } = req.body;
    if (!jsonRoot) {
      return res.status(400).json({ error: 'Missing root node' });
    }

    const options = {
      getHeight: d => rawSize(d.depth || 0).h,
      getWidth:  d => rawSize(d.depth || 0).w,
      getHGap:   d => hgap(d.depth || 0),
      getVGap:   d => vgap(d.depth || 0),
    };

    const root = toLayoutNode(jsonRoot, options);
    const layout = new Standard(root, options);
    const resultRoot = layout.doLayout();
    const nodes = layout.getNodes();

    res.json({ nodes });
  } catch (err) {
    console.error('Layout error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
