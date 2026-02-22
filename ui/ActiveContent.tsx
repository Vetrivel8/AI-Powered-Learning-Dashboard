export default function ActiveContent({ activeTool, props }) {
  return props.renderContent(activeTool);
}
