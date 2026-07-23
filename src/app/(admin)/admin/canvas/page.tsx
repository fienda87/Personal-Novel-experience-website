'use client'

import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { CustomNodeData } from '@/components/canvas/custom-node'
import { CharacterNode, LocationNode, ItemNode } from '@/components/canvas/custom-node'
import { MagnifyingGlass, X, User, Buildings, Cube, Trash, Funnel, FloppyDisk, ArrowSquareOut, UploadSimple, Plus, FadersHorizontal } from '@phosphor-icons/react'

const nodeTypes = {
  character: CharacterNode,
  location: LocationNode,
  item: ItemNode,
}

const nodeTypeMeta = {
  character: { icon: User, label: 'Character', color: 'text-moonstone-blue' },
  location: { icon: Buildings, label: 'Location', color: 'text-ethereal-teal' },
  item: { icon: Cube, label: 'Item', color: 'text-iridescent-silver' },
} as const

export default function CanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [drawerContent, setDrawerContent] = useState<'add' | 'filter' | 'inspect' | null>(null)

  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch('/api/canvas')
      .then((r) => r.json())
      .then((data) => {
        if (data.nodes) {
          setNodes(data.nodes.map((n: Node<CustomNodeData>) => ({
            ...n,
            type: n.type === 'custom' ? n.data?.type ?? 'character' : n.type,
          })))
        }
        if (data.edges) setEdges(data.edges)
        setLoaded(true)
      })
  }, [setNodes, setEdges])

  const save = useCallback((nds: Node[], edgs: Edge[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSaving(true)
      fetch('/api/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: nds, edges: edgs }),
      }).finally(() => setSaving(false))
    }, 500)
  }, [])

  const onNodesChangeWithSave = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes)
      setNodes((nds) => {
        save(nds, edges)
        return nds
      })
    },
    [onNodesChange, edges, save, setNodes]
  )

  const onEdgesChangeWithSave = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes)
      setEdges((edgs) => {
        save(nodes, edgs)
        return edgs
      })
    },
    [onEdgesChange, nodes, save, setEdges]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((edgs) => {
        const next = addEdge(connection, edgs)
        save(nodes, next)
        return next
      })
    },
    [setEdges, nodes, save]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<CustomNodeData>)
    setSelectedEdge(null)
    setDrawerContent('inspect')
  }, [])

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
    setDrawerContent(null)
  }, [])

  const addNode = (type: 'character' | 'location' | 'item') => {
    const meta = nodeTypeMeta[type]
    setNodes((nds) => {
      const newNode: Node<CustomNodeData> = {
        id: `${Date.now()}`,
        type,
        position: {
          x: Math.random() * 400 + 200,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: `New ${meta.label}`,
          type,
          subtitle: 'Click to edit',
          imageUrl: '',
          snippet: '',
          tags: [],
        },
      }
      const next = [...nds, newNode]
      save(next, edges)
      return next
    })
    setDrawerContent(null)
  }

  const deleteSelected = () => {
    if (!selectedNode) return
    setNodes((nds) => {
      const next = nds.filter((n) => n.id !== selectedNode.id)
      save(next, edges)
      return next
    })
    setEdges((edgs) => {
      const next = edgs.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      save(nodes, next)
      return next
    })
    setSelectedNode(null)
    setDrawerContent(null)
  }

  const updateNodeData = useCallback((key: string, value: unknown) => {
    if (!selectedNode) return
    setNodes((nds) => {
      const next = nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, [key]: value } }
          : n
      )
      save(next, edges)
      return next
    })
    setSelectedNode((prev) =>
      prev ? { ...prev, data: { ...prev.data, [key]: value } } : null
    )
  }, [selectedNode, edges, save, setNodes])

  const updateEdgeData = useCallback((key: string, value: unknown) => {
    if (!selectedEdge) return
    setEdges((edgs) => {
      const next = edgs.map((e) =>
        e.id === selectedEdge.id
          ? { ...e, [key]: value }
          : e
      )
      save(nodes, next)
      return next
    })
    setSelectedEdge((prev) =>
      prev ? { ...prev, [key]: value } : null
    )
  }, [selectedEdge, nodes, save, setEdges])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!selectedNode) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/uploads/chapter-banner', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        updateNodeData('imageUrl', url)
      }
    } catch {
      // fail silently
    }
    setUploadingImage(false)
  }, [selectedNode, updateNodeData])

  const deleteEdge = useCallback(() => {
    if (!selectedEdge) return
    setEdges((edgs) => {
      const next = edgs.filter((e) => e.id !== selectedEdge.id)
      save(nodes, next)
      return next
    })
    setSelectedEdge(null)
  }, [selectedEdge, nodes, save, setEdges])

  const filteredNodes = useMemo(() => {
    let result = filterType
      ? nodes.filter((n) => n.data?.type === filterType)
      : nodes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((n) => n.data?.label?.toLowerCase().includes(q))
    }
    return result
  }, [nodes, filterType, searchQuery])

  const handleAutoLayout = useCallback(() => {
    const types = ['character', 'location', 'item'] as const
    const gapX = 320
    const gapY = 160
    const startX = 60
    const startY = 60

    setNodes((nds) => {
      const sorted = [...nds].sort((a, b) => {
        const ta = types.indexOf((a.data?.type || 'character') as typeof types[number])
        const tb = types.indexOf((b.data?.type || 'character') as typeof types[number])
        return ta - tb
      })

      const counts: Record<string, number> = {}
      const next = sorted.map((n) => {
        const type = n.data?.type || 'character'
        const col = counts[type] ?? 0
        counts[type] = col + 1
        return {
          ...n,
          position: { x: col * gapX + startX, y: types.indexOf(type as typeof types[number]) * gapY + startY },
        }
      })
      save(next, edges)
      return next
    })
  }, [edges, save, setNodes])

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-2 h-2 rounded-full bg-moonstone-blue animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    )
  }

  const sidebarContent = (
    <>
      <div className="relative">
        <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl py-2 pl-10 pr-4 font-sans text-sm focus:outline-none focus:ring-moonstone-blue/50 transition-all text-on-surface placeholder:text-on-surface-variant"
          placeholder="Search nodes..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[9px] text-on-surface-variant px-1 uppercase tracking-widest">Add Node</p>
        <div className="flex flex-col gap-1.5">
          {(['character', 'location', 'item'] as const).map((type) => {
            const meta = nodeTypeMeta[type]
            const Icon = meta.icon
            return (
              <button
                key={type}
                onClick={() => addNode(type)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-300 text-on-surface group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center group-hover:ring-moonstone-blue/30 transition-all">
                  <Icon size={14} weight="light" className={meta.color} />
                </div>
                <span className="font-sans text-sm">{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[9px] text-on-surface-variant px-1 uppercase tracking-widest">Filter</p>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { type: null as string | null, label: 'All', color: '' },
            ...(['character', 'location', 'item'] as const).map((t) => ({
              type: t as string | null,
              label: nodeTypeMeta[t].label,
              color: nodeTypeMeta[t].color,
            })),
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => setFilterType(f.type)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                filterType === f.type
                  ? 'bg-moonstone-blue/10 text-moonstone-blue ring-1 ring-moonstone-blue/30'
                  : 'bg-white/5 text-on-surface-variant ring-1 ring-white/10 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <p className="font-mono text-[9px] text-on-surface-variant px-1 uppercase tracking-widest">
          {nodes.length} nodes · {edges.length} connections
        </p>
        <div className="flex items-center gap-2 text-[9px] font-mono text-on-surface-variant">
          <FloppyDisk size={10} weight="light" className={saving ? 'text-moonstone-blue animate-pulse' : ''} />
          {saving ? 'Saving...' : 'Auto-save enabled'}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 z-40 glass p-5 flex-col gap-5 h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Canvas Area — z-30 so navbar pill (z-50) stays on top */}
      <div className="flex-1 overflow-hidden glass relative z-30">
        <div className="w-full h-full">
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChangeWithSave}
            onEdgesChange={onEdgesChangeWithSave}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#121a24]"
            defaultEdgeOptions={{
              style: { stroke: '#2a364f', strokeWidth: 2 },
              type: 'smoothstep',
            }}
          >
            <Background
              color="#2a364f"
              gap={40}
              size={2}
              style={{ backgroundColor: '#121a24' }}
            />
            <Controls className="rounded-xl bg-[#0d1117]/90 backdrop-blur-xl ring-1 ring-white/[0.06] border-0 text-white/70 shadow-2xl" />
            <MiniMap
              className="!absolute !bottom-4 !right-4 !w-36 !h-24 rounded-lg overflow-hidden"
              style={{ background: 'rgba(13,17,23,0.4)', backdropFilter: 'blur(8px)' }}
              nodeColor={(n) =>
                n.data?.type === 'character'
                  ? '#94bbe9'
                  : n.data?.type === 'location'
                    ? '#14b8a6'
                    : '#cbd5e1'
              }
              nodeStrokeColor="#2a364f"
              maskColor="rgba(0,0,0,0.3)"
              pannable
              zoomable
            />
          </ReactFlow>
        </div>
      </div>

      {/* Desktop Inspector Panel */}
      {selectedNode && (
        <aside className="hidden md:flex w-80 z-40 glass-strong flex-col h-full shrink-0">
          <NodeInspectorContent
            node={selectedNode}
            onClose={() => { setSelectedNode(null); setDrawerContent(null) }}
            onDelete={deleteSelected}
            onUpdate={updateNodeData}
            onImageUpload={handleImageUpload}
            uploadingImage={uploadingImage}
            nodes={nodes}
          />
        </aside>
      )}

      {/* Desktop Edge Inspector */}
      {selectedEdge && !selectedNode && (
        <aside className="hidden md:flex w-80 z-40 glass-strong flex-col h-full shrink-0">
          <EdgeInspectorContent
            edge={selectedEdge}
            nodes={nodes}
            onClose={() => { setSelectedEdge(null) }}
            onDelete={deleteEdge}
            onUpdate={updateEdgeData}
          />
        </aside>
      )}

      {/* Mobile Drawer Overlay */}
      {(drawerContent === 'add' || drawerContent === 'filter' || drawerContent === 'inspect') && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerContent(null)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] glass-strong rounded-t-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 flex justify-end p-3 bg-inherit">
              <button
                onClick={() => setDrawerContent(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all"
              >
                <X size={14} weight="light" />
              </button>
            </div>
            <div className="p-5 pt-0 space-y-5">
              {drawerContent === 'add' && (
                <div className="space-y-2">
                  <p className="font-mono text-[9px] text-on-surface-variant px-1 uppercase tracking-widest">Add Node</p>
                  <div className="flex flex-col gap-1.5">
                    {(['character', 'location', 'item'] as const).map((type) => {
                      const meta = nodeTypeMeta[type]
                      const Icon = meta.icon
                      return (
                        <button
                          key={type}
                          onClick={() => addNode(type)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-300 text-on-surface group"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center group-hover:ring-moonstone-blue/30 transition-all">
                            <Icon size={14} weight="light" className={meta.color} />
                          </div>
                          <span className="font-sans text-sm">{meta.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {drawerContent === 'filter' && (
                <>
                  <div className="relative">
                    <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl py-2 pl-10 pr-4 font-sans text-sm focus:outline-none focus:ring-moonstone-blue/50 transition-all text-on-surface placeholder:text-on-surface-variant"
                      placeholder="Search nodes..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-[9px] text-on-surface-variant px-1 uppercase tracking-widest">Filter</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { type: null as string | null, label: 'All', color: '' },
                        ...(['character', 'location', 'item'] as const).map((t) => ({
                          type: t as string | null,
                          label: nodeTypeMeta[t].label,
                          color: nodeTypeMeta[t].color,
                        })),
                      ].map((f) => (
                        <button
                          key={f.label}
                          onClick={() => setFilterType(f.type)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                            filterType === f.type
                              ? 'bg-moonstone-blue/10 text-moonstone-blue ring-1 ring-moonstone-blue/30'
                              : 'bg-white/5 text-on-surface-variant ring-1 ring-white/10 hover:bg-white/10'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-on-surface-variant">
                    {nodes.length} nodes · {edges.length} connections
                  </div>
                </>
              )}
              {drawerContent === 'inspect' && selectedNode && (
                <NodeInspectorContent
                  node={selectedNode}
                  onClose={() => { setSelectedNode(null); setDrawerContent(null) }}
                  onDelete={deleteSelected}
                  onUpdate={updateNodeData}
                  onImageUpload={handleImageUpload}
                  uploadingImage={uploadingImage}
                  nodes={nodes}
                />
              )}
              {drawerContent === 'inspect' && selectedEdge && !selectedNode && (
                <EdgeInspectorContent
                  edge={selectedEdge}
                  nodes={nodes}
                  onClose={() => { setSelectedEdge(null); setDrawerContent(null) }}
                  onDelete={deleteEdge}
                  onUpdate={updateEdgeData}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Toolbar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl md:hidden">
        <button
          onClick={() => setDrawerContent(drawerContent === 'add' ? null : 'add')}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            drawerContent === 'add' ? 'bg-moonstone-blue/10 text-moonstone-blue' : 'text-on-surface-variant hover:text-moonstone-blue hover:bg-white/5'
          }`}
          title="Add Node"
        >
          <Plus size={18} weight="bold" />
        </button>
        <div className="w-px h-5 bg-white/10" />
        {(['character', 'location', 'item'] as const).map((type) => {
          const meta = nodeTypeMeta[type]
          const Icon = meta.icon
          return (
            <button
              key={type}
              onClick={() => addNode(type)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-moonstone-blue hover:bg-white/5 transition-all"
              title={`Add ${meta.label}`}
            >
              <Icon size={14} weight="light" />
            </button>
          )
        })}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button
          onClick={() => setDrawerContent(drawerContent === 'filter' ? null : 'filter')}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            drawerContent === 'filter' ? 'bg-moonstone-blue/10 text-moonstone-blue' : 'text-on-surface-variant hover:text-moonstone-blue hover:bg-white/5'
          }`}
          title="Search / Filter"
        >
          <FadersHorizontal size={16} weight="bold" />
        </button>
      </nav>

      {/* Desktop Bottom Toolbar */}
      <nav className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full bg-black/60 backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl px-5 py-2.5 items-center gap-2">
        {(['character', 'location', 'item'] as const).map((type) => {
          const meta = nodeTypeMeta[type]
          const Icon = meta.icon
          return (
            <button
              key={type}
              onClick={() => addNode(type)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-moonstone-blue hover:bg-white/5 transition-all"
              title={`Add ${meta.label}`}
            >
              <Icon size={16} weight="light" />
            </button>
          )
        })}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button
          onClick={() => setFilterType(filterType ? null : 'character')}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            filterType ? 'bg-moonstone-blue/10 text-moonstone-blue' : 'text-on-surface-variant hover:text-moonstone-blue hover:bg-white/5'
          }`}
          title="Toggle filter"
        >
          <Funnel size={16} weight="light" />
        </button>
        <button
          onClick={handleAutoLayout}
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-moonstone-blue hover:bg-white/5 transition-all"
          title="Auto-layout"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </button>
      </nav>
    </div>
  )
}

// ─── Extracted sub-components ──────────────────────────────────────

function NodeInspectorContent({
  node, onClose, onDelete, onUpdate, onImageUpload, uploadingImage, nodes,
}: {
  node: Node<CustomNodeData>
  onClose: () => void
  onDelete: () => void
  onUpdate: (key: string, value: unknown) => void
  onImageUpload: (file: File) => Promise<void>
  uploadingImage: boolean
  nodes: Node<CustomNodeData>[]
}) {
  const data = node.data as CustomNodeData
  const meta = nodeTypeMeta[data.type]
  const Icon = meta.icon

  return (
    <>
      <div className="p-5 border-b border-white/10 flex justify-between items-center">
        <h2 className="font-display text-lg text-on-surface tracking-tight">Inspector</h2>
        <div className="flex items-center gap-2">
          {data.type === 'character' && (
            <a
              href={`/wiki/character/${node.id}`}
              target="_blank"
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-moonstone-blue hover:bg-white/5 transition-all"
              title="Open in Wiki"
            >
              <ArrowSquareOut size={14} weight="light" />
            </a>
          )}
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete node"
          >
            <Trash size={14} weight="light" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all"
          >
            <X size={14} weight="light" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full ring-1 ring-white/10 p-1 flex items-center justify-center overflow-hidden relative">
              {data.imageUrl ? (
                <img src={data.imageUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <Icon size={22} weight="light" className={meta.color} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <input
                value={data.label}
                onChange={(e) => onUpdate('label', e.target.value)}
                className="w-full bg-transparent font-display text-base text-on-surface outline-none border-b border-white/10 focus:border-moonstone-blue/50 transition-all pb-0.5"
              />
              <p className={`font-mono text-[9px] ${meta.color} uppercase tracking-wider mt-1`}>
                {data.type} node
              </p>
            </div>
          </div>

          <div>
            <label className="font-mono text-[9px] uppercase text-on-surface-variant mb-1.5 block tracking-widest">
              Subtitle
            </label>
            <input
              value={data.subtitle ?? ''}
              onChange={(e) => onUpdate('subtitle', e.target.value)}
              className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl py-2 px-3 text-sm text-on-surface outline-none focus:ring-moonstone-blue/30 transition-all placeholder:text-on-surface-variant"
              placeholder="Click to edit"
            />
          </div>

          <div>
            <label className="font-mono text-[9px] uppercase text-on-surface-variant mb-1.5 block tracking-widest">
              Image
            </label>
            <div className="flex gap-2">
              <input
                value={data.imageUrl ?? ''}
                onChange={(e) => onUpdate('imageUrl', e.target.value)}
                className="flex-1 bg-white/5 ring-1 ring-white/10 rounded-xl py-2 px-3 text-sm text-on-surface outline-none focus:ring-moonstone-blue/30 transition-all placeholder:text-on-surface-variant"
                placeholder="Image URL"
              />
              <label className="w-10 h-10 shrink-0 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all text-on-surface-variant hover:text-on-surface">
                <UploadSimple size={16} weight="light" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={uploadingImage}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageUpload(f) }}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h4 className="font-mono text-[9px] uppercase text-on-surface-variant tracking-widest">Description</h4>
          <textarea
            value={data.snippet ?? ''}
            onChange={(e) => onUpdate('snippet', e.target.value)}
            rows={3}
            className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl py-2 px-3 text-sm text-on-surface outline-none focus:ring-moonstone-blue/30 transition-all placeholder:text-on-surface-variant resize-none"
            placeholder="Brief description..."
          />
        </section>

        <section className="space-y-2">
          <h4 className="font-mono text-[9px] uppercase text-on-surface-variant tracking-widest">Tags</h4>
          <input
            value={(data.tags ?? []).join(', ')}
            onChange={(e) => onUpdate('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl py-2 px-3 text-sm text-on-surface outline-none focus:ring-moonstone-blue/30 transition-all placeholder:text-on-surface-variant"
            placeholder="comma, separated, tags"
          />
        </section>

        {data.type === 'character' && (
          <section className="space-y-3">
            <h4 className="font-mono text-[9px] uppercase text-on-surface-variant tracking-widest">Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              {(['strength', 'agility', 'intelligence', 'charisma', 'wisdom', 'vitality'] as const).map((stat) => (
                <div key={stat} className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                  <label className="font-mono text-[9px] text-on-surface-variant block mb-1 uppercase tracking-wider">{stat.slice(0, 3)}</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={data[stat] ?? 10}
                    onChange={(e) => onUpdate(stat, parseInt(e.target.value) || 10)}
                    className="w-full bg-transparent text-sm font-medium text-on-surface outline-none"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {data.type === 'location' && (
          <section className="space-y-3">
            <h4 className="font-mono text-[9px] uppercase text-on-surface-variant tracking-widest">Details</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                <label className="font-mono text-[9px] text-on-surface-variant block mb-1 uppercase tracking-wider">Faction</label>
                <input
                  value={data.faction ?? ''}
                  onChange={(e) => onUpdate('faction', e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-on-surface outline-none"
                  placeholder="e.g. Order of the Crimson Flame"
                />
              </div>
              <div className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                <label className="font-mono text-[9px] text-on-surface-variant block mb-1 uppercase tracking-wider">City</label>
                <input
                  value={data.city ?? ''}
                  onChange={(e) => onUpdate('city', e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-on-surface outline-none"
                  placeholder="e.g. Aethelgard"
                />
              </div>
            </div>
          </section>
        )}

        {data.type === 'item' && (
          <section className="space-y-3">
            <h4 className="font-mono text-[9px] uppercase text-on-surface-variant tracking-widest">Details</h4>
            <div className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
              <label className="font-mono text-[9px] text-on-surface-variant block mb-1 uppercase tracking-wider">Rarity</label>
              <input
                value={data.rarity ?? ''}
                onChange={(e) => onUpdate('rarity', e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-on-surface outline-none"
                placeholder="e.g. Legendary, Common"
              />
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function EdgeInspectorContent({
  edge, nodes, onClose, onDelete, onUpdate,
}: {
  edge: Edge
  nodes: Node<CustomNodeData>[]
  onClose: () => void
  onDelete: () => void
  onUpdate: (key: string, value: unknown) => void
}) {
  return (
    <>
      <div className="p-5 border-b border-white/10 flex justify-between items-center">
        <h2 className="font-display text-lg text-on-surface tracking-tight">Connection</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete connection"
          >
            <Trash size={14} weight="light" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all"
          >
            <X size={14} weight="light" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
          <label className="font-mono text-[9px] text-on-surface-variant block mb-1 uppercase tracking-wider">Label</label>
          <input
            value={String(edge.label ?? '')}
            onChange={(e) => onUpdate('label', e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-on-surface outline-none"
            placeholder="e.g. Wields, Dwells in"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
            <span className="text-xs text-on-surface-variant">Source</span>
            <span className="text-xs font-mono text-on-surface">{nodes.find((n) => n.id === edge.source)?.data?.label || edge.source}</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
            <span className="text-xs text-on-surface-variant">Target</span>
            <span className="text-xs font-mono text-on-surface">{nodes.find((n) => n.id === edge.target)?.data?.label || edge.target}</span>
          </div>
        </div>
      </div>
    </>
  )
}
