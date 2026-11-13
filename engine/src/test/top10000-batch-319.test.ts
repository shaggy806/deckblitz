// Batch 319: the top 5000's next cards by EDHREC rank (4159–), each on the
// feature it needed.

import { describe, expect, it } from "vitest";

import { A, B, C, activate, attack, cast, counters, destroy, hand, keywords, lands, life, named, pt, ref, settle, spawn, subtypes, table, toHand, toStep, types, zone } from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";
import { printedCardName } from "../state.js";
import type { ObjectId } from "../state.js";

describe("Shay Cormac: opponents' permanents lose hexproof, indestructible, protection, shroud and ward", () => {
  // The opponent's ward triggers waiting on the stack (Shay Cormac's own
  // bounty trigger is yours).
  const wards = (game: ReturnType<typeof table>["game"]): number =>
    game.state.zones.shared.stack.filter((id) => game.state.objects[id].controller === B).length;

  it("protection from black is lost: a black spell can target, and destroys", () => {
    const { game } = table();
    const shay = spawn(game, "Shay Cormac");
    lands(game, "Swamp", 4);
    const knight = spawn(game, "White Knight", B);
    const murder = toHand(game, "Murder");
    expect(() => cast(game, murder, { targets: [ref(knight)] })).toThrow();
    activate(game, shay, 0);
    cast(game, murder, { targets: [ref(knight)] });
    expect(zone(game, knight)).toBe("graveyard");
  });

  it("protection gained after the loss stays (rule 613.7)", () => {
    const { game } = table();
    const shay = spawn(game, "Shay Cormac");
    lands(game, "Swamp", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, shay, 0);
    game.debugApplyEffect(B, { kind: "grant-protection", filter: { type: "creature", controlledBy: "you" }, from: { colors: ["B"] }, duration: "end-of-turn" }, []);
    settle(game);
    const murder = toHand(game, "Murder");
    expect(() => cast(game, murder, { targets: [ref(bear)] })).toThrow();
  });

  it("a printed ward and one a static granted earlier are lost: no ward trigger", () => {
    const { game } = table();
    const shay = spawn(game, "Shay Cormac");
    lands(game, "Swamp", 20);
    // Artifacts B controls have ward {1}; the Spawn has its own ward {2}.
    spawn(game, "Elder Owyn Lyons", B);
    const spawnling = spawn(game, "Aboleth Spawn", B);
    const thopter = spawn(game, "Ornithopter", B);
    // The control: each ward triggers.
    cast(game, toHand(game, "Murder"), { targets: [ref(spawnling)], settle: false });
    expect(wards(game)).toBe(1);
    settle(game);
    cast(game, toHand(game, "Murder"), { targets: [ref(thopter)], settle: false });
    expect(wards(game)).toBe(1);
    settle(game);
    const again = spawn(game, "Aboleth Spawn", B);
    const other = spawn(game, "Ornithopter", B);
    activate(game, shay, 0);
    cast(game, toHand(game, "Murder"), { targets: [ref(again)], settle: false });
    expect(wards(game)).toBe(0);
    settle(game);
    expect(zone(game, again)).toBe("graveyard");
    cast(game, toHand(game, "Murder"), { targets: [ref(other)], settle: false });
    expect(wards(game)).toBe(0);
  });

  it("ward a static grants from a permanent that entered after the loss stays", () => {
    const { game } = table();
    const shay = spawn(game, "Shay Cormac");
    lands(game, "Swamp", 4);
    const thopter = spawn(game, "Ornithopter", B);
    activate(game, shay, 0);
    spawn(game, "Elder Owyn Lyons", B);
    const murder = toHand(game, "Murder");
    cast(game, murder, { targets: [ref(thopter)], settle: false });
    expect(wards(game)).toBe(1);
  });

  it("a creature you target gets a bounty counter, and one dying grows Shay Cormac", () => {
    const { game } = table();
    const shay = spawn(game, "Shay Cormac");
    lands(game, "Swamp", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const murder = toHand(game, "Murder");
    cast(game, murder, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(counters(game, shay)).toBe(2);
    // Your own creature gets no counter, so its death gives nothing.
    destroy(game, mine);
    expect(counters(game, shay)).toBe(2);
  });
});

describe("Norn's Decree: poison for combat damage to you, a card for attacking a poisoned player", () => {
  const poison = (game: ReturnType<typeof table>["game"], player: typeof A): number => game.state.players[player].counters.poison ?? 0;
  const poisonOpponents = (game: ReturnType<typeof table>["game"], by: typeof A): void => {
    game.debugApplyEffect(by, { kind: "add-player-counters", counter: "poison", amount: 1, who: "each-opponent" }, []);
    settle(game);
  };

  it("two creatures dealing you combat damage at once give their controller one poison counter", () => {
    const { game, a } = table();
    spawn(game, "Norn's Decree", B);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    attack(game, a, [x, y]);
    expect(life(game, B)).toBe(16);
    expect(poison(game, A)).toBe(1);
    expect(poison(game, B)).toBe(0);
  });

  it("attacking a poisoned player draws the attacking player one card, however many are attacked", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Norn's Decree", C);
    poisonOpponents(game, A);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    a.declareAttackersFn = () => [{ attacker: x, defender: B }, { attacker: y, defender: C }];
    toStep(game, "postcombat-main");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("no card when the attack is at a planeswalker of a poisoned player", () => {
    const { game, a } = table();
    spawn(game, "Norn's Decree", B);
    poisonOpponents(game, A);
    const walker = spawn(game, "Jace Beleren", B);
    const x = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    attack(game, a, [x], walker);
    expect(hand(game, A).length).toBe(before);
  });

  it("no card when nobody attacked is poisoned", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Norn's Decree", C);
    // Only alice is poisoned, and she's the one attacking.
    poisonOpponents(game, B);
    game.state.players[C].counters.poison = 0;
    const x = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    attack(game, a, [x], B);
    expect(poison(game, A)).toBe(1);
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Benthic Anomaly: a token copy of one of the creatures chosen, one per opponent, with their total power and toughness", () => {
  const token = (game: ReturnType<typeof table>["game"]): ObjectId => {
    const made = Object.values(game.state.objects).filter((o) => o.isToken && o.zone === "battlefield" && o.controller === A);
    expect(made.length).toBe(1);
    return made[0].id;
  };

  it("copies the one you pick, as a colorless Eldrazi creature with the totals", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 7);
    spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", C);
    // One question per opponent (a creature of theirs), then which to copy.
    const asked: number[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      asked.push(eligible.length);
      return eligible.length === 1 ? eligible : [angel];
    };
    cast(game, toHand(game, "Benthic Anomaly"));
    expect(asked.at(-1)).toBe(2);
    const made = token(game);
    expect(printedCardName(game.state.objects[made])).toBe("Serra Angel");
    expect(pt(game, made)).toEqual({ power: 6, toughness: 6 });
    expect(types(game, made)).toEqual(["creature"]);
    expect(subtypes(game, made)).toEqual(["Eldrazi"]);
    expect(computeCharacteristics(game.state, game.registry, made).colors.size).toBe(0);
    expect(keywords(game, made).has("flying")).toBe(true);
    // The Anomaly itself resolved after its trigger.
    expect(named(game, "Benthic Anomaly", A).length).toBe(1);
  });

  it("an opponent with no creature has none chosen; with none at all there's no token", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 14);
    cast(game, toHand(game, "Benthic Anomaly"));
    expect(Object.values(game.state.objects).filter((o) => o.isToken).length).toBe(0);
    const bear = spawn(game, "Grizzly Bears", C);
    void bear;
    cast(game, toHand(game, "Benthic Anomaly"));
    const made = token(game);
    expect(printedCardName(game.state.objects[made])).toBe("Grizzly Bears");
    expect(pt(game, made)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, made)).toEqual(["Eldrazi"]);
  });
});
