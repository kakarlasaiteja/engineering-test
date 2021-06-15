import { httpMock } from "shared/helpers/http-mock"
import { add, get, LocalStorageKey } from "shared/helpers/local-storage"
import { ApiResponse } from "shared/interfaces/http.interface"
import { Activity } from "shared/models/activity"
import { Roll } from "shared/models/roll"

export async function getActivities(): Promise<ApiResponse<{ activity: Activity[] }>> {
  try {
    const rolls = get<Roll[]>(LocalStorageKey.rolls) || []

    await httpMock({ randomFailure: true })
    return {
      success: true,
      activity: buildActivities(),
    }
  } catch (error) {
    return {
      success: false,
      error: {},
    }
  }
}

export function buildActivities(): Activity[] {
  let rolls = get<Roll[]>(LocalStorageKey.rolls) || []
  add(LocalStorageKey.activities, rolls.map((item) => ({
    type: "roll",
    entity: item,
    date: item.completed_at,
  })))
  return get<Activity[]>(LocalStorageKey.activities) || []
}
