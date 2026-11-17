/**
 * "You may put an Aura or Equipment card from your hand or graveyard onto
 * the battlefield. If an Equipment is put onto the battlefield this way, you
 * may attach it to a creature you control." (Vault 101: Birthday Party —
 * need key effect:attach-to-chosen-creature): one choice over hand and
 * graveyard together (`return-from-graveyard`'s `"hand-or-graveyard"`, up to
 * one), an Aura's host chosen as it enters (rule 303.4f, not targeted), and
 * the Equipment's creature chosen as it resolves (`choose-permanents`, then
 * `attach` of the Equipment put onto the battlefield this way). An Aura with
 * nothing it could enchant isn't offered at all (303.4g; the card's ruling).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, enter, graveyard, hand, pickPermanents, ref, settle, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

/** One more lore counter on the Saga, its chapter ability resolved. */
function lore(game: Game, saga: ObjectId): void {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
  settle(game);
}

const attachedTo = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo;

describe("Vault 101: Birthday Party", () => {
  it("I creates a Human Soldier and a Food", () => {
    const { game } = table();
    enter(game, "Vault 101: Birthday Party");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("II puts an Equipment card from the graveyard onto the battlefield and attaches it to the creature chosen", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blade = toGraveyard(game, "Bonesplitter");
    const pacifism = toHand(game, "Pacifism");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [blade];
    };
    const saga = enter(game, "Vault 101: Birthday Party");
    const picked = pickPermanents(a, bears);
    lore(game, saga);
    // Hand and graveyard together, one choice.
    expect([...offered].sort()).toEqual([blade, pacifism].sort());
    expect(zone(game, blade)).toBe("battlefield");
    expect(picked.offered).toContain(bears);
    expect(attachedTo(game, blade)).toBe(bears);
    expect(hand(game)).toContain(pacifism);
  });

  it("may leave the Equipment unattached", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const blade = toHand(game, "Bonesplitter");
    a.chooseFromZoneFn = () => [blade];
    const saga = enter(game, "Vault 101: Birthday Party");
    pickPermanents(a);
    lore(game, saga);
    expect(zone(game, blade)).toBe("battlefield");
    expect(attachedTo(game, blade)).toBeNull();
  });

  it("puts an Aura onto the battlefield on what its controller chooses — an opponent's creature too — and asks nothing about attaching", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const pacifism = toHand(game, "Pacifism");
    a.chooseFromZoneFn = () => [pacifism];
    let enchantOptions: readonly ObjectId[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      enchantOptions = options;
      return theirs;
    };
    let askedToAttach = false;
    a.choosePermanentsFn = () => {
      askedToAttach = true;
      return [];
    };
    const saga = enter(game, "Vault 101: Birthday Party");
    lore(game, saga);
    expect(enchantOptions).toContain(theirs);
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(attachedTo(game, pacifism)).toBe(theirs);
    expect(askedToAttach).toBe(false);
  });

  it("doesn't offer an Aura with nothing it could enchant", () => {
    const { game, a } = table();
    const pacifism = toGraveyard(game, "Pacifism");
    const blade = toHand(game, "Bonesplitter");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [];
    };
    const saga = enter(game, "Vault 101: Birthday Party");
    // Chapter I's Human Soldier is a creature: gone, nothing is left to enchant.
    for (const id of game.battlefield.filter((o) => game.state.objects[o].cardName === "Human Soldier Token")) {
      game.debugMove(id, "graveyard");
    }
    lore(game, saga);
    expect(offered).toEqual([blade]);
    expect(graveyard(game)).toContain(pacifism);
    expect(zone(game, blade)).toBe("hand");
  });
});
