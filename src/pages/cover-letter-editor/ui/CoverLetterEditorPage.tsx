import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useRecords } from '@/entities/application';
import { Button, Field, IconButton, TextInput, inputClass } from '@/shared/ui';
import { countChars, useSaveShortcut } from '@/shared/lib';

/**
 * @description 자기소개서를 작성하는 페이지
 */
export function CoverLetterEditorPage() {
  const navigate = useNavigate();
  const { coverLetter, updateCoverLetter, updateSection, addSection, removeSection, moveSection, saveCoverLetter } =
    useRecords();
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveCoverLetter();
      navigate('/portfolio');
    } finally {
      setSaving(false);
    }
  }, [saving, saveCoverLetter, navigate]);

  useSaveShortcut(save);

  const total = coverLetter.sections.reduce((sum, s) => sum + countChars(s.body), 0);

  return (
    <>
      <Link
        to="/portfolio"
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
          <Link to="/cover-letter/preview">
            <Button variant="outline">미리보기</Button>
          </Link>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? '저장 중…' : '저장'}
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
                  <IconButton label="항목 삭제" size="sm" tone="danger" onClick={() => removeSection(section.id)}>
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
                className={`${inputClass} min-h-50 resize-none whitespace-pre-wrap text-[15px] leading-[1.9]`}
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
    </>
  );
}
