/**
 * "You may choose the same mode more than once" (rule 700.2d): a modal
 * spell's chosen modes may repeat (`castModal.repeatModes`), the spell done
 * as though a mode chosen n times appeared n times in sequence, each copy of
 * a targeted mode with its own slots — the same target or different ones.
 * And "choose one that hasn't been chosen" over an object's whole time on the
 * battlefield (`notChosenBefore`), which Kimoyo Beads proves on a trigger.
 */

import { describe, expect, it } from "vitest";

import { fillModes } from "../actions.js";
import type { LegalAction } from "../actions.js";
import { modeChoicesBetween, multisets } from "../decisions/shared/subsets.js";
import { A, B, cast, graveyard, hand, lands, life, named, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const offerFor = (game: ReturnType<typeof table>["game"], card: string): CastOffer | undefined =>
  game.legalActions(A).find(
    (a): a is CastOffer => a.kind === "cast-spell" && game.state.objects[a.card]?.cardName === card,
  );

describe("repeated modes (rule 700.2d)", () => {
  it("Fiery Confluence: the same mode three times is three separate 2 damage to each opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 4);
    const confluence = toHand(game, "Fiery Confluence");
    expect(offerFor(game, "Fiery Confluence")?.castModal?.repeatModes).toBe(true);
    cast(game, confluence, { modes: [1, 1, 1] });
    expect(life(game, B)).toBe(14);
    expect(life(game, "carol" as typeof B)).toBe(14);
    expect(life(game, A)).toBe(20);
  });

  it("Fiery Confluence: 1 damage to each creature twice kills a 2/2, and the artifact mode takes its target", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const relic = spawn(game, "Sol Ring", B);
    const confluence = toHand(game, "Fiery Confluence");
    // Modes in any order are done in printed order: 0, 0, then 2.
    cast(game, confluence, { modes: [2, 0, 0], targets: [ref(relic)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(zone(game, relic)).toBe("graveyard");
  });

  it("Mystic Confluence: each bounce mode its own target, and draw for the third", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const confluence = toHand(game, "Mystic Confluence");
    const before = hand(game).length;
    cast(game, confluence, { modes: [1, 1, 2], targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    // The Confluence left the hand, a card was drawn.
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toContain(confluence);
  });

  it("Mystic Confluence: two copies of a mode may name the same target (the second then does nothing)", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const confluence = toHand(game, "Mystic Confluence");
    const before = hand(game).length;
    cast(game, confluence, { modes: [1, 1, 2], targets: [ref(bears), ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before);
  });

  it("Mystic Confluence with no spell or creature to target is cast as three draws", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const confluence = toHand(game, "Mystic Confluence");
    const offer = offerFor(game, "Mystic Confluence");
    expect(offer).toBeDefined();
    expect(game.canDispatch({ type: "cast-spell", player: A, card: confluence, targets: [], modes: [2, 2] })).not.toBeNull();
    const before = hand(game).length;
    cast(game, confluence, { modes: [2, 2, 2] });
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("a modal spell without the permission still can't repeat a mode", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 2);
    spawn(game, "Sol Ring", B);
    const command = toHand(game, "Kolaghan's Command");
    expect(offerFor(game, "Kolaghan's Command")?.castModal?.repeatModes).toBeUndefined();
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: command, targets: [ref(B), ref(B)], modes: [1, 1] }),
    ).toMatch(/twice/);
  });
});

describe("mode choices for drivers", () => {
  it("multisets and mode choices enumerate repeats only when allowed", () => {
    expect(multisets([0, 1], 2, 99)).toEqual([[0, 0], [0, 1], [1, 1]]);
    expect(modeChoicesBetween([0, 1, 2], 3, 3, false, 99)).toEqual([[0, 1, 2]]);
    expect(modeChoicesBetween([0, 1, 2], 3, 3, true, 99)).toHaveLength(10);
    expect(modeChoicesBetween([0, 1], 1, 2, true, 99)).toEqual([[0], [1], [0, 0], [0, 1], [1, 1]]);
  });

  it("fillModes takes the usable modes again in turn when a mode may repeat", () => {
    expect(fillModes([2], 3, 3, true)).toEqual([2, 2, 2]);
    expect(fillModes([2, 0], 3, 3, true)).toEqual([0, 2, 2]);
    expect(fillModes([2], 3, 3, false)).toBeNull();
    expect(fillModes([0, 1, 2, 3], 2, 2, false)).toEqual([0, 1]);
    expect(fillModes([], 3, 3, true)).toBeNull();
  });

  it("the bots cast a repeatable modal spell whose only usable mode is one", () => {
    const { game } = table();
    lands(game, "Island", 5);
    toHand(game, "Mystic Confluence");
    const offer = offerFor(game, "Mystic Confluence");
    const usable = offer?.castModal?.modes
      .map((_m, i) => i)
      .filter((i) => offer.castModal?.modes[i].targetOptions.every((o) => o.length > 0));
    expect(usable).toEqual([2]);
    expect(fillModes(usable ?? [], 3, 3, true)).toEqual([2, 2, 2]);
  });
});

describe("Kimoyo Beads — choose one that hasn't been chosen", () => {
  it("offers only the modes not yet chosen, and Prime Bead's return starts the memory afresh", () => {
    const { game, a } = table();
    spawn(game, "Kimoyo Beads");
    let offered: readonly string[] = [];
    const choose = (prefix: string): void => {
      a.chooseModesFn = (_view, _min, _max, texts) => {
        offered = texts;
        return [texts.findIndex((t) => t.startsWith(prefix))];
      };
    };
    choose("AV Bead");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(offered).toHaveLength(3);
    expect(hand(game).length).toBe(before + 1);

    choose("Communication Bead");
    toStep(game, "end");
    settle(game);
    expect(offered).toHaveLength(2);
    expect(offered.some((t) => t.startsWith("AV Bead"))).toBe(false);
    expect(named(game, "Soldier Token", A).length).toBeGreaterThan(0);

    choose("Prime Bead");
    const lifeBefore = life(game, A);
    toStep(game, "end");
    settle(game);
    expect(offered).toHaveLength(1);
    expect(life(game, A)).toBe(lifeBefore + 3);
    // A new object (rule 400.7): every mode is open again.
    const returned = named(game, "Kimoyo Beads", A)[0];
    expect(returned).toBeDefined();
    choose("AV Bead");
    toStep(game, "end");
    settle(game);
    expect(offered).toHaveLength(3);
  });
});
