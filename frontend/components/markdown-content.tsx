import ReactMarkdown from 'react-markdown'
import * as React from "react"
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headers
          h1: ({...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
          h2: ({ ...props }) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
          h3: ({...props }) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
          
          // Text
          p: ({ children, ...props }) => (
            <p className="whitespace-pre-wrap" {...props}>
              {children}
            </p>
          ),
          strong: ({...props }) => <strong className="font-bold" {...props} />,
          em: ({ ...props }) => <em className="italic" {...props} />,
          
          // Lists - Custom implementation with hyphens
          ul: ({ children, depth, ...props }) => (
            <ul 
              className={`my-2 ${depth > 0 ? 'pl-3 list-dash' : 'list-none'}`} 
              {...props}
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, {
                    depth,
                    className: `flex items-start ${depth > 0 ? 'pl-2' : ''}`
                  } as React.HTMLProps<HTMLLIElement>)
                }
                return child
              })}
            </ul>
          ),
          li: ({ children, ordered, depth, ...props }) => (
            <li className={props.className} {...props}>
              {!ordered && depth === 0 && (
                <span className="mr-2">-</span>
              )}
              <div className="flex-1">
                {children}
              </div>
            </li>
          ),
          
          a: ({ ...props }) => (
            <a 
              className="text-blue-600 hover:text-blue-800 hover:underline" 
              target="_blank"
              rel="noopener noreferrer"
              {...props} 
            />
          ),
          code({className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const inline = !className?.includes('language-')
            
            return inline ? (
              <code className="bg-gray-100 px-1.5 py-0.5 text-sm font-mono">
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={materialLight}
                language={match?.[1] || 'text'}
                PreTag="div"
                className="text-sm mb-3"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          blockquote: ({...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" {...props} />
          ),
          hr: ({ ...props }) => <hr className="my-4 border-gray-200" {...props} />,
          table: ({...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse my-3" {...props} />
            </div>
          ),
          th: ({...props }) => (
            <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50 font-semibold" {...props} />
          ),
          td: ({...props }) => (
            <td className="border border-gray-300 px-3 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}