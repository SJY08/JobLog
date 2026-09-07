import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, Trash2Icon } from 'lucide-react';
import {
  APPLY_STATUSES,
  PLATFORMS,
  POSTING_STATUSES,
  emptyApplication,
  useRecords,
  type Application,
  type ApplyStatus,
  type PlatformValue,
  type PostingStatus
} from '@/entities/application';
import { RegionPicker } from '@/widgets/region-picker';
import { ConfirmDialog } from '@/widgets/confirm-dialog';
import { Button, DatePicker, Field, IconButton, SelectInput, TextInput, inputClass } from '@/shared/ui';
import { isValidUrl, longDate, today, useSaveShortcut } from '@/shared/lib';

type Errors = Partial<Record<keyof Application, string>>;

/**
 * @description 지원 기록 초안을 검증하는 함수
 */
function validate(draft: Application): Errors {
  const errors: Errors = {};
  if (!draft.platform) errors.platform = '지원 플랫폼을 선택해 주세요.';
  if (!draft.company.trim()) errors.company = '회사명을 입력해 주세요.';
  if (!draft.region) errors.region = '지역을 검색해 선택해 주세요.';
  if (!draft.position.trim()) errors.position = '지원 포지션을 입력해 주세요.';
  if (!draft.appliedAt) errors.appliedAt = '지원일을 선택해 주세요.';
  if (!draft.postingStatus) errors.postingStatus = '공고상태를 선택해 주세요.';
  if (draft.link && !isValidUrl(draft.link)) errors.link = 'http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.';
  return errors;
}

/**
 * @description 지원 기록을 작성/수정하는 페이지
 */
export function ApplicationDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const isNew = id === 'new' || location.pathname.endsWith('/applications/new');
  const navigate = useNavigate();
  const { loading, getApplication, createApplication, updateApplication, removeApplications } = useRecords();
  const original = isNew ? undefined : getApplication(id);

  const [draft, setDraft] = useState<Application | null>(isNew ? emptyApplication() : original ?? null);
  const [errors, setErrors] = useState<Errors>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const notFound = !isNew && !loading && !original && !draft;

  useEffect(() => {
    if (!isNew && original && !draft) {
      setDraft(original);
    }
  }, [isNew, original, draft]);

  const dirty = useMemo(() => {
    if (!draft) return false;
    if (isNew) return JSON.stringify(draft) !== JSON.stringify(emptyApplication());
    return !!original && JSON.stringify(draft) !== JSON.stringify(original);
  }, [draft, original, isNew]);

  const save = useCallback(async () => {
    if (!draft) return;
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (isNew) {
      const newId = await createApplication(draft);
      navigate(`/applications/${newId}`, { replace: true });
      return;
    }
    const next = { ...draft, updatedAt: today() };
    await updateApplication(next.id, next);
    setDraft(next);
    setSavedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
  }, [draft, isNew, createApplication, updateApplication, navigate]);

  useSaveShortcut(save, !!draft);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!draft && !notFound) {
    return null;
  }

  if (!draft || notFound) {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px] font-semibold text-ink">기록을 찾을 수 없습니다.</p>
        <Link to="/applications" className="mt-3 inline-block text-[13px] text-primary underline underline-offset-4">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const set = <K extends keyof Application>(key: K, value: Application[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <>
      <Link
        to="/applications"
        className="inline-flex items-center gap-1.5 text-[13px] text-mute transition-colors duration-150 ease-out hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        취업활동 기록
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <h1 className="truncate text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[26px]">
            {draft.company || (isNew ? '새 지원 기록' : '회사명 미입력')}
          </h1>
          <p className="mt-2 text-[13px] text-mute">
            {isNew
              ? '필수 항목(*)을 채우면 저장할 수 있습니다.'
              : `${draft.position || '포지션 미입력'} · 마지막 수정 ${longDate(draft.updatedAt)}`}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {!isNew && savedAt && !dirty && (
            <span className="inline-flex items-center gap-1 text-2xs text-success">
              <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {savedAt} 저장됨
            </span>
          )}
          {dirty && <span className="text-2xs text-mute">저장되지 않은 변경사항</span>}
          <Button variant="primary" onClick={save} disabled={!isNew && !dirty}>
            저장
          </Button>
          {!isNew && (
            <IconButton label="이 기록 삭제" tone="danger" onClick={() => setConfirming(true)} className="border border-line">
              <Trash2Icon className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </div>

      {hasErrors && (
        <p className="mt-4 rounded-md border border-danger/30 bg-dangerSoft px-3.5 py-3 text-[13px] text-danger">
          필수 항목이 비어 있어 저장하지 못했습니다. 표시된 항목을 확인해 주세요.
        </p>
      )}

      <div className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <div>
          <h2 className="text-[13px] font-semibold text-graphite">지원 정보</h2>
          <div className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field label="지원 플랫폼" required error={errors.platform} htmlFor="platform">
              <SelectInput
                id="platform"
                invalid={!!errors.platform}
                value={draft.platform}
                onChange={(e) => set('platform', e.target.value as PlatformValue)}
              >
                <option value="" disabled>
                  선택해 주세요
                </option>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="회사명" required error={errors.company} htmlFor="company">
              <TextInput
                id="company"
                invalid={!!errors.company}
                value={draft.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="예: 한화시스템"
              />
            </Field>

            <Field label="지역" required error={errors.region} hint="검색 후 선택" htmlFor="region" className="sm:col-span-2">
              <RegionPicker id="region" invalid={!!errors.region} value={draft.region} onChange={(region) => set('region', region)} />
            </Field>

            <Field label="지원 포지션" required error={errors.position} htmlFor="position" className="sm:col-span-2">
              <TextInput
                id="position"
                invalid={!!errors.position}
                value={draft.position}
                onChange={(e) => set('position', e.target.value)}
                placeholder="예: 프론트엔드 엔지니어 (신입)"
              />
            </Field>

            <Field label="공고 링크" hint="https:// 형식" error={errors.link} htmlFor="link" className="sm:col-span-2">
              <TextInput
                id="link"
                type="url"
                inputMode="url"
                invalid={!!errors.link}
                value={draft.link}
                onChange={(e) => set('link', e.target.value)}
                placeholder="https://www.wanted.co.kr/wd/000000"
              />
            </Field>
          </div>

          <h2 className="mt-10 border-t border-line pt-7 text-[13px] font-semibold text-graphite">진행 상황</h2>
          <div className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field label="지원일" required error={errors.appliedAt} htmlFor="appliedAt">
              <DatePicker
                id="appliedAt"
                value={draft.appliedAt}
                invalid={!!errors.appliedAt}
                onChange={(v) => set('appliedAt', v)}
                placeholder="지원일 선택"
              />
            </Field>

            <Field label="공고상태" required error={errors.postingStatus} htmlFor="postingStatus">
              <SelectInput
                id="postingStatus"
                invalid={!!errors.postingStatus}
                value={draft.postingStatus}
                onChange={(e) => set('postingStatus', e.target.value as PostingStatus)}
              >
                {POSTING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="열람 여부" className="sm:col-span-2">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <label className="inline-flex items-center gap-2 text-sm text-graphite">
                  <input
                    type="checkbox"
                    checked={draft.viewed}
                    onChange={(e) => {
                      const viewed = e.target.checked;
                      setDraft((prev) =>
                        prev ? { ...prev, viewed, viewedAt: viewed ? prev.viewedAt || today() : null } : prev
                      );
                    }}
                    className="h-4 w-4 rounded border-line accent-primary"
                  />
                  기업이 이력서를 열람함
                </label>
                <div className="w-42.5">
                  <DatePicker
                    value={draft.viewedAt ?? ''}
                    onChange={(v) => set('viewedAt', v || null)}
                    disabled={!draft.viewed}
                    min={draft.appliedAt || undefined}
                    placeholder="열람일"
                    allowClear
                  />
                </div>
              </div>
            </Field>

            <Field label="지원상태" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {APPLY_STATUSES.map((s) => {
                  const active = draft.applyStatus === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set('applyStatus', s as ApplyStatus)}
                      className={`rounded-full border px-3.5 py-2 text-[13px] transition-colors duration-150 ease-out ${
                        active
                          ? 'border-primary bg-primarySoft font-semibold text-primary'
                          : 'border-line bg-surface text-graphite hover:bg-hover'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start lg:border-l lg:border-line lg:pl-8">
          <h2 className="text-[13px] font-semibold text-graphite">메모</h2>
          <textarea
            value={draft.memo}
            onChange={(e) => set('memo', e.target.value)}
            rows={10}
            placeholder={'면접 일정, 담당자, 준비할 것\n예: 1차 면접 8/28 14:00'}
            className={`${inputClass} mt-3 resize-none leading-relaxed`}
          />
          <p className="mt-2 text-2xs leading-relaxed text-mute">
            줄바꿈까지 그대로 저장됩니다. 결과가 나오면 지원상태를 함께 바꿔주세요.
          </p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirming}
        title="이 지원 기록을 삭제할까요?"
        description={`${draft.company || '이름 없는 기록'} · 삭제하면 되돌릴 수 없습니다.`}
        onConfirm={() => {
          removeApplications([draft.id]);
          navigate('/applications');
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
