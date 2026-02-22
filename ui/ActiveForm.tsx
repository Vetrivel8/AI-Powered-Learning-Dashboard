export default function ActiveForm({ activeTool, tools, props }) {
  const activeToolData = tools.find(t => t.id === activeTool);
  if (!activeToolData) return null;

  return (
    <div id="tool-form">
      <ToolFormCard title={activeToolData.name} icon={activeToolData.icon} theme={activeToolData.theme}>
          {props.renderForm(activeTool)}
      </ToolFormCard>
    </div>
  );
}
