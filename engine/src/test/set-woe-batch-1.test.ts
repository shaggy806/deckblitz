/**
 * Wilds of Eldraine (WOE) set batch 1 — the Role cards (the Role machinery
 * itself is `roles.test.ts`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, enter, keywords, lands, pickModes, pickTargets, pt, ref, settle, spawn, table, toExile, toGraveyard, toHand, toStep, zone } from "./harness.js";

const rolesOn = (game: Game, host: ObjectId): string[] =>
  game.state.zones.shared.battlefield
    .filter((id) => game.state.objects[id].attachedTo === host)
    .map((id) => game.state.objects[id].cardName)
    .sort();

describe("Wilds of Eldraine batch 1: Roles", () => {
  it("Unassuming Sage: paying {2} puts a Sorcerer Role on itself; declining, none", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    a.chooseModesFn = () => [0];
    const sage = enter(game, "Unassuming Sage");
    expect(rolesOn(game, sage)).toEqual(["Sorcerer Role Token"]);
    expect(pt(game, sage)).toEqual({ power: 3, toughness: 3 });
    a.chooseModesFn = () => [];
    const other = enter(game, "Unassuming Sage");
    expect(rolesOn(game, other)).toEqual([]);
  });

  it("Syr Armont: a Monster Role on another creature, and enchanted creatures you control get +1/+1", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Syr Armont, the Redeemer");
    expect(rolesOn(game, bears)).toEqual(["Monster Role Token"]);
    // +1/+1 from the Role, +1/+1 from Armont.
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Become Brutes: two targets each get haste and a Monster Role", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Become Brutes"), { targets: [ref(one), ref(two)] });
    expect(rolesOn(game, one)).toEqual(["Monster Role Token"]);
    expect(rolesOn(game, two)).toEqual(["Monster Role Token"]);
  });

  it("Twisted Fealty: two instances of 'target' — the stolen creature may also get the Wicked Role", () => {
    const { game } = table();
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Twisted Fealty"), { targets: [ref(theirs), ref(theirs)] });
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(rolesOn(game, theirs)).toEqual(["Wicked Role Token"]);
  });

  it("Return Triumphant: the returned creature gets a Young Hero Role", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Return Triumphant"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(rolesOn(game, bears)).toEqual(["Young Hero Role Token"]);
  });

  it("Gylwain: an entering nontoken creature gets the Role of the mode chosen", () => {
    const { game, a } = table();
    spawn(game, "Gylwain, Casting Director");
    pickModes(a, 2);
    const bears = enter(game, "Grizzly Bears");
    expect(rolesOn(game, bears)).toEqual(["Monster Role Token"]);
  });

  it("Spellbook Vendor: paying {1} at combat puts a Sorcerer Role on the target", () => {
    const { game, a } = table();
    spawn(game, "Spellbook Vendor");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    a.chooseModesFn = () => [0];
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(rolesOn(game, bears)).toEqual(["Sorcerer Role Token"]);
  });

  describe("older cards that waited on Roles", () => {
    it("Ellivere: a Virtuous Role (+1/+1 per enchantment you control), and an enchanted creature's combat damage draws", () => {
      const { game, a } = table();
      const bears = spawn(game, "Grizzly Bears");
      pickTargets(a, bears);
      enter(game, "Ellivere of the Wild Court");
      expect(rolesOn(game, bears)).toEqual(["Virtuous Role Token"]);
      // The Role itself is the one enchantment.
      expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
      const hand = game.state.zones.perPlayer[A].hand.length;
      a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
      toStep(game, "postcombat-main");
      settle(game);
      expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 1);
    });

    it("Lord Skitter's Blessing: with an enchanted creature, the draw step loses 1 life and draws one more", () => {
      const { game, a } = table();
      const bears = spawn(game, "Grizzly Bears");
      pickTargets(a, bears);
      enter(game, "Lord Skitter's Blessing");
      expect(rolesOn(game, bears)).toEqual(["Wicked Role Token"]);
      // Alice's next upkeep, then her draw step: the normal draw and one more.
      toStep(game, "upkeep");
      settle(game);
      const life = game.state.players[A].life;
      const hand = game.state.zones.perPlayer[A].hand.length;
      toStep(game, "precombat-main");
      settle(game);
      expect(game.state.players[A].life).toBe(life - 1);
      expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 2);
    });

    it("Monstrous Rage: +2/+0 and a Monster Role on the same creature", () => {
      const { game } = table();
      const bears = spawn(game, "Grizzly Bears");
      lands(game, "Mountain", 1);
      cast(game, toHand(game, "Monstrous Rage"), { targets: [ref(bears)] });
      expect(rolesOn(game, bears)).toEqual(["Monster Role Token"]);
      expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    });

    it("Charming Scoundrel: the third mode puts a Wicked Role on a target", () => {
      const { game, a } = table();
      const bears = spawn(game, "Grizzly Bears");
      pickModes(a, 2);
      pickTargets(a, bears);
      enter(game, "Charming Scoundrel");
      expect(rolesOn(game, bears)).toEqual(["Wicked Role Token"]);
    });
  });

  describe("'has an Adventure' (rule 715.2a)", () => {
    it("Edgewall Inn: only a card that has an Adventure can be returned", () => {
      const { game } = table();
      const inn = spawn(game, "Edgewall Inn");
      const adventurer = toGraveyard(game, "Ferocious Werefox");
      const plain = toGraveyard(game, "Grizzly Bears");
      lands(game, "Forest", 3);
      game.state.objects[inn].tapped = false;
      const activation = (card: ObjectId) =>
        ({ type: "activate-ability", player: A, source: inn, abilityIndex: 1, targets: [ref(card)] }) as const;
      expect(game.canDispatch(activation(plain))).not.toBeNull();
      expect(game.canDispatch(activation(adventurer))).toBeNull();
      game.dispatch(activation(adventurer));
      settle(game);
      expect(zone(game, adventurer)).toBe("hand");
    });

    it("Howling Galefang: haste only while you own an exiled card that has an Adventure", () => {
      const { game } = table();
      const galefang = spawn(game, "Howling Galefang");
      expect(keywords(game, galefang).has("haste")).toBe(false);
      toExile(game, "Grizzly Bears");
      expect(keywords(game, galefang).has("haste")).toBe(false);
      toExile(game, "Ferocious Werefox");
      expect(keywords(game, galefang).has("haste")).toBe(true);
    });

    it("Hearth Elemental: {1} less for each instant, sorcery or adventurer card in your graveyard", () => {
      const { game } = table();
      toGraveyard(game, "Opt");
      toGraveyard(game, "Ferocious Werefox");
      toGraveyard(game, "Grizzly Bears");
      lands(game, "Mountain", 4);
      cast(game, toHand(game, "Hearth Elemental"));
      expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Hearth Elemental")).toBe(true);
    });
  });
});

