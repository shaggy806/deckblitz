/**
 * A copy exception that replaces every subtype (`setAllSubtypes`): The Eleventh
 * Hour's "create a token that's a copy of target creature, except it's a
 * legendary Alien named Prisoner Zero". Its ruling: the token keeps its card
 * types but "will lose any non-Alien subtypes it has, such as Human or
 * Vehicle" — not only its creature types, as `setSubtypes` would (rule
 * 205.1a's same-kind replacement). Part of the copiable values (rule 707.9b),
 * and a copy's subtypes are only those that go with its types (205.3d).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, B, pickTargets, ref, settle, spawn, subtypes, supertypes, table, tokensNamed, types } from "./harness.js";

const PRISONER_ZERO = { addSupertypes: ["legendary"], setAllSubtypes: ["Alien"], name: "Prisoner Zero" } as const;

/** Battlefield permanents named `name` now (a copy's exception name too). */
const named = (game: Game, name: string, player: PlayerId): ObjectId[] =>
  game.battlefield.filter((id) => nameOf(game.state.objects[id]) === name && game.state.objects[id].controller === player);

/** A token copy of `of` made with The Eleventh Hour's exceptions. */
function prisonerZero(game: Game, of: ObjectId): ObjectId {
  game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you", exceptions: PRISONER_ZERO }, [ref(of)]);
  settle(game);
  const [token] = named(game, "Prisoner Zero", A);
  return token;
}

describe("a copy exception that replaces every subtype", () => {
  it("makes a legendary Alien named Prisoner Zero, its card types kept", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const token = prisonerZero(game, bears);
    expect(types(game, token)).toEqual(["creature"]);
    expect(subtypes(game, token)).toEqual(["Alien"]);
    expect(supertypes(game, token)).toContain("legendary");
  });

  it("takes a land type too, not only creature types (the ruling)", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor", B);
    const token = prisonerZero(game, arbor);
    expect([...types(game, token)].sort()).toEqual(["creature", "land"]);
    expect(subtypes(game, token)).toEqual(["Alien"]);
  });

  it("is a copiable value: a copy of the token is Prisoner Zero, an Alien", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor", B);
    const token = prisonerZero(game, arbor);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(token)]);
    settle(game);
    const copies = named(game, "Prisoner Zero", A);
    expect(copies).toHaveLength(2);
    expect(subtypes(game, copies[1])).toEqual(["Alien"]);
  });
});

describe("The Eleventh Hour", () => {
  it("II makes a Food and a 1/1 Human whose Doctor spells cost less", () => {
    const { game } = table();
    const saga = spawn(game, "The Eleventh Hour");
    game.state.objects[saga].counters.lore = 1;
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Human Token (Doctor spells you cast cost {1} less)", A)).toBe(1);
  });

  it("III copies target creature as a legendary Alien named Prisoner Zero", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const saga = spawn(game, "The Eleventh Hour");
    game.state.objects[saga].counters.lore = 2;
    pickTargets(a, giant);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    const [token] = named(game, "Prisoner Zero", A);
    expect(token).toBeDefined();
    expect(subtypes(game, token)).toEqual(["Alien"]);
    expect(supertypes(game, token)).toContain("legendary");
  });
});
