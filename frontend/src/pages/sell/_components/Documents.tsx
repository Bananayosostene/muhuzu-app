import { FileCheck, FileWarning, FileX } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { documentTypes, type DocumentType, type Seller } from '@/types/seller'

interface Props {
  seller: Pick<Seller, 'documents' | 'missing_documents'>
  busy: boolean
  onUpload: (type: DocumentType, file: File) => void
  onOpen: (type: DocumentType) => void
  onRemove: (type: DocumentType) => void
}

const types = Object.keys(documentTypes).filter((type): type is DocumentType => type in documentTypes)

/** The files that prove who the seller is. They are stored privately and opened through short-lived links. */
export function Documents({ seller, busy, onUpload, onOpen, onRemove }: Props) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold">Documents</h2>
      <p className="text-sm text-muted-foreground">A clear photo or scan: JPEG, PNG or PDF, up to 5 MB each. Only you and Muhuze staff can open them.</p>
      <ul className="mt-4 divide-y">
        {types.map((type) => {
          const file = seller.documents.find((document) => document.document_type === type)
          const missing = seller.missing_documents.includes(type)
          const Icon = file ? FileCheck : missing ? FileWarning : FileX
          return (
            <li key={type} className="flex flex-wrap items-center gap-3 py-3">
              <Icon className={file ? 'size-5 text-primary' : missing ? 'size-5 text-destructive' : 'size-5 text-muted-foreground'} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{documentTypes[type]}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {file ? file.original_filename ?? 'Uploaded' : missing ? 'Required before you can send the application' : 'Not uploaded'}
                </p>
              </div>
              {file && <Button variant="ghost" size="sm" onClick={() => onOpen(type)}>View</Button>}
              {file && <Button variant="ghost" size="sm" className="text-destructive" disabled={busy} onClick={() => onRemove(type)}>Remove</Button>}
              <label className={buttonVariants({ variant: 'outline', size: 'sm', className: busy ? 'pointer-events-none opacity-50' : 'cursor-pointer' })}>
                {file ? 'Replace' : 'Upload'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="sr-only"
                  onChange={(event) => {
                    const chosen = event.target.files?.[0]
                    if (chosen) onUpload(type, chosen)
                    // Lets the same file be chosen again after a failed upload.
                    event.target.value = ''
                  }}
                />
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
