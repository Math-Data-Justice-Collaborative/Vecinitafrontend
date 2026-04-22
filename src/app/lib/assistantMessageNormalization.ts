export function extractAssistantTextFromPayload(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.answer === 'string' && record.answer.trim().length > 0) {
    return record.answer;
  }

  const message = record.message;
  if (message && typeof message === 'object') {
    const content = (message as Record<string, unknown>).content;
    if (typeof content === 'string' && content.trim().length > 0) {
      return content;
    }
  }

  if (typeof record.content === 'string' && record.content.trim().length > 0) {
    return record.content;
  }

  return '';
}
