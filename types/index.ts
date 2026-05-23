import type { User, Workspace, WorkspaceMember, Board, List, Card, Activity, MemberRole } from "@prisma/client"

export type WorkspaceWithMembers = Workspace & {
  members: (WorkspaceMember & {
    user: User
  })[]
  owner: User
}

export type BoardWithLists = Board & {
  lists: (List & {
    cards: Card[]
  })[]
}

export type CardWithList = Card & {
  list: List
}

export type ActivityWithUser = Activity & {
  user: User
}

export type SafeUser = Pick<User, "id" | "name" | "email" | "image">

export { MemberRole }
