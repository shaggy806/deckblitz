/**
 * An activated ability's "Exile a card from your graveyard" beside a sacrifice
 * of several in the same cost (Tawnos, Solemn Survivor's "Sacrifice two
 * artifact tokens, Exile an artifact or creature card from your graveyard"):
 * one cost asks one thing at a time, so the graveyard card is asked for once
 * the sacrifice is paid (`pendingCostSacrifice.thenGraveyardExile`; a cost's
 * parts are paid in any order, rule 601.2h).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  graveyard,
  lands,
  named,
  pickFromZone,
  ref,
  spawn,
  table,
  toGraveyard,
  types,
  zone,
} from "./harness.js";

const clues = (game: Game, n: number): ObjectId[] => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: n, separate: true });
  return named(game, "Clue Token", A);
};
const manaFor = (game: Game): void => {
  lands(game, "Plains", 1);
  lands(game, "Island", 2);
  lands(game, "Swamp", 1);
};
const tokenCopies = (game: Game, name: string): ObjectId[] =>
  named(game, name, A).filter((id) => game.state.objects[id].isToken);

describe("Tawnos, Solemn Survivor", () => {
  it("sacrifices two artifact tokens, exiles the card, and copies it as an artifact", () => {
    const { game } = table();
    const tawnos = spawn(game, "Tawnos, Solemn Survivor", A);
    manaFor(game);
    const [first, second] = clues(game, 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Island");
    activate(game, tawnos, 1);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[first]?.zone ?? "gone").not.toBe("battlefield");
    expect(game.state.objects[second]?.zone ?? "gone").not.toBe("battlefield");
    const [copy] = tokenCopies(game, "Grizzly Bears");
    expect(copy).toBeDefined();
    expect(types(game, copy)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });

  it("asks what to sacrifice first, then which card to exile", () => {
    const { game, a } = table();
    const tawnos = spawn(game, "Tawnos, Solemn Survivor", A);
    manaFor(game);
    const tokens = clues(game, 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, tawnos, 1, { settle: false });
    const asked = game.legalActions(A).find((x): x is Extract<LegalAction, { kind: "sacrifice" }> => x.kind === "sacrifice");
    expect(asked?.count).toBe(2);
    expect(asked?.exile).toBeUndefined();
    // Nothing exiled from the graveyard yet: one question at a time.
    expect(graveyard(game, A)).toEqual(expect.arrayContaining([bears, giant]));
    const seen = pickFromZone(a, giant);
    game.dispatch({ type: "sacrifice", player: A, permanents: [tokens[0], tokens[2]] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[tokens[1]]?.zone).toBe("battlefield");
    expect(tokenCopies(game, "Hill Giant").length).toBe(1);
  });

  it("can't be activated without an artifact or creature card in the graveyard", () => {
    const { game } = table();
    const tawnos = spawn(game, "Tawnos, Solemn Survivor", A);
    manaFor(game);
    clues(game, 2);
    toGraveyard(game, "Lightning Bolt");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: tawnos, abilityIndex: 1, targets: [] }),
    ).toMatch(/graveyard/);
  });

  it("copies up to one artifact token you control and mills two", () => {
    const { game } = table();
    const tawnos = spawn(game, "Tawnos, Solemn Survivor", A);
    lands(game, "Island", 2);
    const [clue] = clues(game, 1);
    const before = graveyard(game, A).length;
    activate(game, tawnos, 0, { targets: [ref(clue)] });
    expect(named(game, "Clue Token", A).length).toBe(2);
    expect(graveyard(game, A).length).toBe(before + 2);
  });
});
