import { useEffect, useRef, useState } from 'react';
import { FileIcon, PaperclipIcon, XIcon } from 'lucide-react';
import { FILE_KINDS, type FileKind } from '@/entities/file';
import { fileSize } from '@/shared/lib';
import { Button, Field, IconButton, Modal, SelectInput } from '@/shared/ui';

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (kind: FileKind, files: File[]) => void;
}

/**
 * @description 파일 업로드 모달 컴포넌트
 */
export function FileUploadModal({ open, onClose, onSubmit }: FileUploadModalProps) {
  const [kind, setKind] = useState<FileKind>('이력서');
  const [picked, setPicked] = useState<File[]>([]);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setKind('이력서');
      setPicked([]);
      setError('');
    }
  }, [open]);

  function submit() {
    if (picked.length === 0) {
      setError('추가할 파일을 선택해 주세요.');
      return;
    }
    onSubmit(kind, picked);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="파일 추가"
      description="어떤 서류인지 먼저 정하고 파일을 선택하세요."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={submit}>
            추가하기
          </Button>
        </>
      }
    >
      <div className="space-y-4 pb-1">
        <Field label="파일 종류" required htmlFor="upload-kind">
          <SelectInput id="upload-kind" value={kind} onChange={(e) => setKind(e.target.value as FileKind)}>
            {FILE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="파일 선택" required error={error} hint="PDF만 미리보기 지원">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-line bg-surface px-4 py-6 text-[13px] text-graphite transition-colors duration-150 ease-out hover:bg-hover"
          >
            <PaperclipIcon className="h-4 w-4 text-mute" aria-hidden="true" />
            {picked.length > 0 ? '다른 파일 선택' : '파일 선택하기'}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.hwp,.zip"
            className="sr-only"
            onChange={(e) => {
              const list = e.target.files ? Array.from(e.target.files) : [];
              if (list.length > 0) {
                setPicked(list);
                setError('');
              }
              e.target.value = '';
            }}
          />
        </Field>

        {picked.length > 0 && (
          <ul className="rounded-md border border-line">
            {picked.map((f) => (
              <li
                key={f.name + f.size}
                className="flex items-center gap-2.5 border-b border-lineSoft px-3 py-2.5 last:border-b-0"
              >
                <FileIcon className="h-4 w-4 shrink-0 text-mute" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{f.name}</span>
                <span className="shrink-0 text-2xs tabular-nums text-mute">{fileSize(f.size)}</span>
                <IconButton
                  label={`${f.name} 목록에서 제거`}
                  size="sm"
                  onClick={() => setPicked((prev) => prev.filter((x) => x !== f))}
                >
                  <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
