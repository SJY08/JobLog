import { Button, Modal } from '@/shared/ui';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * @description 삭제 확인 다이얼로그 컴포넌트
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '삭제',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      maxWidth="max-w-sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
