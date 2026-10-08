import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useRecords } from '@/entities/application';
import { ConfirmDialog } from '@/widgets/confirm-dialog';
import { Button, Field, IconButton, Skeleton, TextInput, buttonClass, inputClass, useToast } from '@/shared/ui';
import { countChars, useSaveShortcut } from '@/shared/lib';

/**
 * @description 자기소개서를 작성하는 페이지
 */
export function CoverLetterEditorPage() {
  const navigate = useNavigate();
  const {
    loading,
    coverLetter,
    coverLetterDirty: dirty,
    discardCoverLetter,
    updateCoverLetter,
    updateSection,
    addSection,
    removeSection,
    moveSection,
    saveCoverLetter
  } = useRecords();
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const toast = useToast();

  const save = useCallback(async () => {
    if (saving || loading) return;
    setSaving(true);
    try {
      await saveCoverLetter();
      toast.success('자기소개서를 저장했습니다.');
    } catch {
      toast.error('저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }, [saving, loading, saveCoverLetter, toast]);

  useSaveShortcut(save);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (loading) {
    return (
      <div role="status" aria-label="불러오는 중">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-6 h-7 w-48" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        <div className="mx-auto mt-10 max-w-190 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-50 w-full" />
        </div>
      </div>
    );
  }

  const total = coverLetter.sections.reduce((sum, s) => sum + countChars(s.body), 0);

  return (
    <>
      <Link
        to="/portfolio"
        onClick={(e) => {
          if (!dirty) return;
          e.preventDefault();
          setLeaving(true);
        }}
        className="inline-flex items-center gap-1.5 text-[13px] text-mute transition-colors duration-150 ease-out hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        포트폴리오 정리
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[26px]">자기소개서 작성</h1>
          <p className="mt-2 text-[13px] text-mute">
            항목 <span className="tabular-nums text-graphite">{coverLetter.sections.length}</span>개 · 공백 제외{' '}
            <span className="tabular-nums text-graphite">{total}</span>자 · 줄바꿈과 빈 줄도 그대로 저장됩니다.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {dirty && !saving && <span className="text-2xs text-mute">저장되지 않은 변경사항</span>}
          <Link to="/cover-letter/preview" className={buttonClass('outline')}>
            미리보기
          </Link>
          <Button variant="primary" onClick={save} disabled={saving || !dirty}>
            {saving ? '저장 중…' : dirty ? '저장' : '저장됨'}
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-7 w-full max-w-95 space-y-5">
        <Field label="이름" htmlFor="applicant">
          <TextInput
            id="applicant"
            value={coverLetter.applicantName}
            onChange={(e) => updateCoverLetter({ applicantName: e.target.value })}
            placeholder="예: 김대마"
          />
        </Field>
        <Field label="지원 회사" hint="선택" htmlFor="target-company">
          <TextInput
            id="target-company"
            value={coverLetter.targetCompany}
            onChange={(e) => updateCoverLetter({ targetCompany: e.target.value })}
            placeholder="예: 한화시스템"
          />
        </Field>
        <Field label="지원 포지션" hint="선택" htmlFor="target-position">
          <TextInput
            id="target-position"
            value={coverLetter.targetPosition}
            onChange={(e) => updateCoverLetter({ targetPosition: e.target.value })}
            placeholder="예: 소프트웨어 개발"
          />
        </Field>
      </div>

      <div className="mx-auto mt-10 w-full max-w-190">
        {coverLetter.sections.map((section, i) => (
          <section key={section.id} className="group border-t border-line py-6">
            <div className="flex items-center gap-2.5">
              <span className="w-6 shrink-0 tabular-nums text-2xs text-mute">{String(i + 1).padStart(2, '0')}</span>
              <input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                placeholder="항목 제목 (예: 협업 경험)"
                aria-label={`${i + 1}번째 항목 제목`}
                className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1.5 text-[17px] font-semibold text-ink transition-colors duration-150 ease-out hover:border-line focus:border-primary focus:outline-none"
              />
              <div className="flex shrink-0 items-center gap-0.5">
                <IconButton label="위로 이동" size="sm" disabled={i === 0} onClick={() => moveSection(section.id, -1)}>
                  <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label="아래로 이동"
                  size="sm"
                  disabled={i === coverLetter.sections.length - 1}
                  onClick={() => moveSection(section.id, 1)}
                >
                  <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                {section.locked ? (
                  <span className="ml-1 whitespace-nowrap text-2xs text-mute">기본 항목</span>
                ) : (
                  <IconButton label="항목 삭제" size="sm" tone="danger" onClick={() => {
                      if (section.body.trim() || section.title.trim()) setPendingRemove(section.id);
                      else removeSection(section.id);
                    }}
                  >
                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                )}
              </div>
            </div>

            <div className="mt-3 sm:pl-8">
              <textarea
                value={section.body}
                onChange={(e) => updateSection(section.id, { body: e.target.value })}
                rows={9}
                placeholder="여기에 작성하세요."
                aria-label={`${section.title || `${i + 1}번째 항목`} 내용`}
                className={`${inputClass} auto-grow min-h-50 resize-none whitespace-pre-wrap text-[15px] leading-[1.9]`}
              />
              <p className="mt-1.5 text-right text-2xs tabular-nums text-mute">
                {countChars(section.body)}자 (공백 제외) · {section.body.length}자 (공백 포함)
              </p>
            </div>
          </section>
        ))}

        <div className="border-t border-line pt-6">
          <Button variant="outline" onClick={() => addSection()}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            항목 추가
          </Button>
          <p className="mt-2.5 text-2xs leading-relaxed text-mute">
            기본 4개 항목은 삭제할 수 없습니다. 기업 문항에 맞춰 항목을 추가하거나 순서를 바꿔 쓰면 그대로 미리보기에
            반영됩니다.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={pendingRemove !== null}
        title="이 항목을 삭제할까요?"
        description="작성한 내용도 함께 지워집니다. 저장하기 전까지는 되돌릴 수 있습니다."
        onConfirm={() => {
          if (pendingRemove) removeSection(pendingRemove);
          setPendingRemove(null);
        }}
        onCancel={() => setPendingRemove(null)}
      />

      <ConfirmDialog
        open={leaving}
        title="저장하지 않고 나갈까요?"
        description="저장하지 않은 변경사항은 사라집니다."
        confirmLabel="나가기"
        cancelLabel="계속 작성"
        onConfirm={() => {
          discardCoverLetter();
          navigate('/portfolio');
        }}
        onCancel={() => setLeaving(false)}
      />
    </>
  );
}
