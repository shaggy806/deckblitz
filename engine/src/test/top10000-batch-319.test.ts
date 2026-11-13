// Batch 319: the top 5000's next cards by EDHREC rank (4159–), each on the
// feature it needed.

import { describe, expect, it } from "vitest";

import { A, B, C, activate, attack, cast, counters, destroy, hand, keywords, lands, life, named, nextTurn, pickModes, pickTargets, pt, ref, settle, spawn, subtypes, table, toHand, toStep, types, zone } from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";
import { printedCardName } from "../state.js";
import type { ObjectId } from "../primitives.js";

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

describe("The Millennium Calendar: a time counter for each permanent your untap step untaps", () => {
  it("counts what your untap step untapped, the Calendar included, once for the step", () => {
    const { game } = table();
    const calendar = spawn(game, "The Millennium Calendar", A, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Grizzly Bears", A);
    // Bob's untap step is not yours: nothing.
    spawn(game, "Grizzly Bears", B, { tapped: true });
    nextTurn(game);
    expect(counters(game, calendar, "time")).toBe(0);
    nextTurn(game);
    expect(counters(game, calendar, "time")).toBe(3);
  });

  it("doubles its counters, and at 1,000 is sacrificed and each opponent loses 1,000 life", () => {
    const { game } = table({ players: 3 });
    const calendar = spawn(game, "The Millennium Calendar");
    lands(game, "Wastes", 2);
    game.state.objects[calendar].counters.time = 500;
    activate(game, calendar, 0);
    expect(zone(game, calendar)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20 - 1000);
    expect(life(game, C)).toBe(20 - 1000);
  });
});

describe("Neyith of the Dire Hunt: one card when one or more of your creatures fight or become blocked", () => {
  it("two of your creatures fighting each other draw one card", () => {
    const { game } = table();
    spawn(game, "Neyith of the Dire Hunt");
    const x = spawn(game, "Hill Giant");
    const y = spawn(game, "Hill Giant");
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "fight", a: 0, b: 1 }, [ref(x), ref(y)]);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("an opponent's creatures fighting each other draw nothing", () => {
    const { game } = table();
    spawn(game, "Neyith of the Dire Hunt");
    const x = spawn(game, "Hill Giant", B);
    const y = spawn(game, "Hill Giant", B);
    const before = hand(game, A).length;
    game.debugApplyEffect(B, { kind: "fight", a: 0, b: 1 }, [ref(x), ref(y)]);
    settle(game);
    expect(hand(game, A).length).toBe(before);
  });

  it("two of your creatures becoming blocked draw one card", () => {
    const { game, a, b } = table();
    spawn(game, "Neyith of the Dire Hunt");
    const x = spawn(game, "Hill Giant");
    const y = spawn(game, "Hill Giant");
    const p = spawn(game, "Hill Giant", B);
    const q = spawn(game, "Hill Giant", B);
    // No target for the combat ability's doubling matters here: decline it.
    pickModes(a);
    const before = hand(game, A).length;
    b.declareBlockersFn = () => [{ blocker: p, attacker: x }, { blocker: q, attacker: y }];
    attack(game, a, [x, y]);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("paying doubles the target's power; it must be blocked this combat either way", () => {
    for (const pay of [true, false]) {
      const { game, a } = table();
      spawn(game, "Neyith of the Dire Hunt");
      lands(game, "Forest", 3);
      const giant = spawn(game, "Hill Giant");
      pickTargets(a, giant);
      if (pay) pickModes(a, 0);
      else pickModes(a);
      toStep(game, "declare-attackers");
      expect(pt(game, giant).power).toBe(pay ? 6 : 3);
      const rules = computeCharacteristics(game.state, game.registry, giant).restrictions;
      expect(rules.has("must-be-blocked-if-able")).toBe(true);
      toStep(game, "postcombat-main");
      expect(computeCharacteristics(game.state, game.registry, giant).restrictions.has("must-be-blocked-if-able")).toBe(false);
      expect(pt(game, giant).power).toBe(pay ? 6 : 3);
    }
  });
});

describe("Teferi, Mage of Zhalfir: creature cards you own that aren't on the battlefield have flash", () => {
  it("your creature card casts at instant speed, on an opponent's turn; a sorcery and an opponent's creature don't", () => {
    const { game } = table();
    spawn(game, "Teferi, Mage of Zhalfir");
    lands(game, "Forest", 6);
    lands(game, "Forest", 6, B);
    const bears = toHand(game, "Grizzly Bears");
    const sorcery = toHand(game, "Divination");
    const theirs = toHand(game, "Grizzly Bears", B);
    expect(keywords(game, bears).has("flash")).toBe(true);
    expect(keywords(game, sorcery).has("flash")).toBe(false);
    expect(keywords(game, theirs).has("flash")).toBe(false);
    // Bob's upkeep: alice has priority after he passes.
    toStep(game, "upkeep", B);
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(() => cast(game, sorcery)).toThrow();
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("without Teferi the same cast is refused (the control), and a Teferi with no abilities grants nothing", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bears = toHand(game, "Grizzly Bears");
    toStep(game, "upkeep", B);
    game.dispatch({ type: "pass-priority", player: B });
    expect(() => cast(game, bears)).toThrow();
    const teferi = spawn(game, "Teferi, Mage of Zhalfir");
    expect(keywords(game, bears).has("flash")).toBe(true);
    game.debugApplyEffect(B, { kind: "become", target: 0, loseAbilities: true, duration: "end-of-turn" }, [ref(teferi)]);
    settle(game);
    expect(keywords(game, bears).has("flash")).toBe(false);
  });

  it("an opponent casts only at sorcery timing", () => {
    const { game } = table();
    spawn(game, "Teferi, Mage of Zhalfir");
    lands(game, "Mountain", 2, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    game.dispatch({ type: "pass-priority", player: A });
    expect(() => cast(game, bolt, { player: B, targets: [ref(A)] })).toThrow();
  });
});
