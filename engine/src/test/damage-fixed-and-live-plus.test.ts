/**
 * A would-deal-damage replacement (rule 614.1a) that adds an amount read as the
 * damage would be dealt, from "another" source, and one a spell or ability
 * makes for a turn: `plusOf`, `fromOther` and `player-effect`'s
 * `damageReplacement` (its `plus` fixed as it resolves, or a fixed `setTo`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, cast, lands, life, pickModes, quiet, ref, spawn, table, toHand, zone } from "./harness.js";

const shock = (game: Game, target: ReturnType<typeof ref>): ObjectId => {
  const card = toHand(game, "Shock");
  lands(game, "Mountain", 1);
  cast(game, card, { targets: [target] });
  return card;
};

describe("plus 1 from another source you control", () => {
  it("Thor adds to a spell's damage to an opponent, not to himself or to you", () => {
    const { game } = table();
    spawn(game, "Thor, Asgard's Avenger");
    shock(game, ref(B));
    expect(life(game, B)).toBe(17);
    shock(game, ref(A));
    expect(life(game, A)).toBe(18);
  });

  it("Embermaw Hellion adds to another red source only, whoever is hit", () => {
    const { game, a } = table();
    const hellion = spawn(game, "Embermaw Hellion");
    shock(game, ref(A));
    expect(life(game, A)).toBe(17);
    const wurm = spawn(game, "Craw Wurm", B);
    shock(game, ref(wurm));
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    // Not its own damage: "another" is by object, so a second Hellion's would
    // count and this one's doesn't.
    attack(game, a, [hellion]);
    expect(life(game, B)).toBe(16);
  });

  it("an opponent's source isn't one you control", () => {
    const { game } = table();
    spawn(game, "Thor, Asgard's Avenger", B);
    shock(game, ref(B));
    expect(life(game, B)).toBe(18);
  });
});

describe("plus an amount read as the damage would be dealt", () => {
  it("Hawkeye adds his power to noncombat damage to an opponent's side", () => {
    const { game } = table();
    spawn(game, "Hawkeye, Young Avenger");
    shock(game, ref(B));
    expect(life(game, B)).toBe(16);
  });

  it("Fated Firepower adds its fire counters, as many as X", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const firepower = toHand(game, "Fated Firepower");
    cast(game, firepower, { x: 2 });
    expect(game.state.objects[firepower].counters.fire).toBe(2);
    shock(game, ref(B));
    expect(life(game, B)).toBe(16);
  });
});

describe("a replacement a spell or ability makes for the turn", () => {
  it("Equal Treatment: any source's 1 or more becomes 2", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Equal Treatment"));
    shock(game, ref(B));
    expect(life(game, B)).toBe(18);
    // A bigger hit comes down too: it's "2 damage", not "at least 2".
    const flame = toHand(game, "Lava Axe");
    lands(game, "Mountain", 5);
    cast(game, flame, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });

  it("Equal Treatment draws its card", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const hand = game.state.zones.perPlayer[A].hand.length;
    cast(game, toHand(game, "Equal Treatment"));
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 1);
  });

  it("Rankle and Torbran's third mode: plus 2 to players and battles, not creatures, whoever's source", () => {
    const { game, a } = table();
    const rankle = spawn(game, "Rankle and Torbran");
    const wurm = spawn(game, "Craw Wurm", B);
    game.state.objects[wurm].tapped = true;
    pickModes(a, 2);
    attack(game, a, [rankle]);
    expect(life(game, B)).toBe(17);
    shock(game, ref(B));
    expect(life(game, B)).toBe(13);
    shock(game, ref(A));
    expect(life(game, A)).toBe(16);
    shock(game, ref(wurm));
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    const battle = spawn(game, "Invasion of Zendikar", B);
    game.state.objects[battle].counters.defense = 9;
    shock(game, ref(battle));
    expect(game.state.objects[battle].counters.defense).toBe(5);
  });

  it("The Flame of Keld's chapter III: your red sources, this turn only", () => {
    const { game } = table();
    const saga = spawn(game, "The Flame of Keld");
    game.state.objects[saga].counters.lore = 2;
    const mainOf = (turn: number) => (s: Game["state"]) =>
      s.turn.number === turn && s.turn.step === "precombat-main" && s.priority.holder === A && quiet(s);
    game.advanceUntil(mainOf(3));
    // Sacrificed after III, and what III made goes on.
    expect(zone(game, saga)).toBe("graveyard");
    shock(game, ref(B));
    expect(life(game, B)).toBe(16);
    game.advanceUntil(mainOf(5));
    shock(game, ref(B));
    expect(life(game, B)).toBe(14);
  });
});

describe("the order of several damage modifiers (rule 616.1)", () => {
  it("the player being dealt the damage gets the order that hurts least", () => {
    const { game } = table();
    // Doubled and plus 2: 2 + 2 then doubled would be 8; doubled then plus 2 is 6.
    const firepower = spawn(game, "Fated Firepower");
    game.state.objects[firepower].counters.fire = 2;
    spawn(game, "Furnace of Rath");
    shock(game, ref(B));
    expect(life(game, B)).toBe(14);
  });
});

describe("what a prevention names of the damage's source", () => {
  it("Swans of Bryn Argoll: the source's controller draws that many", () => {
    const { game } = table();
    const swans = spawn(game, "Swans of Bryn Argoll", B);
    const hand = game.state.zones.perPlayer[A].hand.length;
    shock(game, ref(swans));
    expect(game.state.objects[swans].damageMarked).toBe(0);
    // Alice's Shock drew Alice two.
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 2);
  });

  it("Reckless Embermage deals 1 to any target and 1 to itself at once", () => {
    const { game } = table();
    const mage = spawn(game, "Reckless Embermage");
    lands(game, "Mountain", 2);
    game.dispatch({ type: "activate-ability", player: A, source: mage, abilityIndex: 0, targets: [ref(B)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[mage].damageMarked).toBe(1);
  });
});
