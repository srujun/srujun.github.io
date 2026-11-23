(() => {
  const escapeHtml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const joinLines = (val) => (Array.isArray(val) ? val.join('') : val || '');

  const renderMarkdown = (src) => {
    const lines = src.split('\n');
    return lines
      .map((line) => {
        const h3 = line.match(/^###\s+(.+)/);
        if (h3) return `<h4>${escapeHtml(h3[1])}</h4>`;
        const h2 = line.match(/^##\s+(.+)/);
        if (h2) return `<h3>${escapeHtml(h2[1])}</h3>`;
        const h1 = line.match(/^#\s+(.+)/);
        if (h1) return `<h2>${escapeHtml(h1[1])}</h2>`;
        if (!line.trim()) return '';
        return `<p>${escapeHtml(line)}</p>`;
      })
      .join('');
  };

  const renderOutput = (output) => {
    if (output.output_type === 'stream') {
      const text = joinLines(output.text);
      return `<pre class="nb-output-text">${escapeHtml(text)}</pre>`;
    }

    if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
      const data = output.data || {};
      if (data['text/html']) {
        return `<div class="nb-output-html">${joinLines(data['text/html'])}</div>`;
      }
      if (data['text/plain']) {
        return `<pre class="nb-output-text">${escapeHtml(joinLines(data['text/plain']))}</pre>`;
      }
    }

    return '';
  };

  const renderNotebook = (container, nb, url) => {
    const filename = url.split('/').pop();
    const cellsHtml = (nb.cells || [])
      .map((cell) => {
        const src = joinLines(cell.source);
        if (!src.trim()) return '';

        if (cell.cell_type === 'markdown') {
          return `<div class="nb-cell nb-cell-md">${renderMarkdown(src)}</div>`;
        }

        if (cell.cell_type === 'code') {
          const count = cell.execution_count != null ? cell.execution_count : ' ';
          const outputs = (cell.outputs || []).map(renderOutput).filter(Boolean).join('');
          return `
            <div class="nb-cell nb-cell-code">
              <div class="nb-prompt">In [${count}]:</div>
              <div class="nb-cell-body">
                <pre class="nb-code"><code>${escapeHtml(src)}</code></pre>
                ${outputs ? `<div class="nb-outputs">${outputs}</div>` : ''}
              </div>
            </div>
          `;
        }

        return '';
      })
      .join('');

    container.innerHTML = `
      <div class="nb-header">
        <span class="nb-filename">${escapeHtml(filename)}</span>
        <a class="nb-download" href="${escapeHtml(url)}" download>Download .ipynb</a>
      </div>
      <div class="nb-cells">${cellsHtml}</div>
    `;
  };

  document.querySelectorAll('[data-notebook]').forEach(async (container) => {
    const url = container.getAttribute('data-notebook');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const nb = await res.json();
      renderNotebook(container, nb, url);
    } catch {
      container.innerHTML = `<p class="nb-error">Could not load notebook. <a href="${escapeHtml(url)}">Download ${escapeHtml(url.split('/').pop())}</a>.</p>`;
    }
  });
})();
