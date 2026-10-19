/**
 * Commander Legends: Battle for Baldur's Gate, group c. One test (or two) per
 * card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** Warehouse Thief's ability, sacrificing `fodder`. */
const steal = (game: Game, thief: ObjectId, fodder: ObjectId): void => {
  const action = { type: "activate-ability", player: A, source: thief, abilityIndex: 0, targets: [], sacrifice: fodder } as const;
  expect(game.canDispatch(action)).toBeNull();
  game.dispatch(action);
  settle(game);
};

describe("Pegasus Guardian // Rescue the Foal", () => {
  it("Rescue the Foal flickers the creature (its counters gone); a permanent having left makes a Pegasus at end step", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const card = toHand(game, "Pegasus Guardian");
    cast(game, card, { face: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Pegasus Token", A)).toBe(1);
  });

  it("makes no Pegasus on a turn nothing you controlled left the battlefield", () => {
    const { game } = table();
    spawn(game, "Pegasus Guardian");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Pegasus Token", A)).toBe(0);
  });
});

describe("Guardian Naga // Banishing Coils", () => {
  it("Banishing Coils exiles an artifact, and the Naga is cast from exile afterwards", () => {
    const { game } = table();
    lands(game, "Plains", 10);
    const ring = spawn(game, "Sol Ring", B);
    const card = toHand(game, "Guardian Naga");
    cast(game, card, { face: 1, targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("vigilance")).toBe(true);
  });

  it("prevents damage dealt to it during your turn, but not during an opponent's", () => {
    const { game } = table();
    const naga = spawn(game, "Guardian Naga");
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 4 }, [ref(naga)]);
    settle(game);
    expect(damageOn(game, naga)).toBe(0);
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 4 }, [ref(naga)]);
    settle(game);
    expect(damageOn(game, naga)).toBe(4);
  });
});

describe("Viconia, Drow Apostate", () => {
  it("returns a creature card at random once four or more are in your graveyard", () => {
    const { game } = table();
    spawn(game, "Viconia, Drow Apostate");
    const creatures = [
      toGraveyard(game, "Grizzly Bears"),
      toGraveyard(game, "Hill Giant"),
      toGraveyard(game, "Llanowar Elves"),
      toGraveyard(game, "Craw Wurm"),
    ];
    const ring = toGraveyard(game, "Sol Ring");
    toStep(game, "upkeep");
    settle(game);
    const back = creatures.filter((id) => zone(game, id) === "hand");
    expect(back.length).toBe(1);
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("does nothing with only three creature cards there", () => {
    const { game } = table();
    spawn(game, "Viconia, Drow Apostate");
    const creatures = [
      toGraveyard(game, "Grizzly Bears"),
      toGraveyard(game, "Hill Giant"),
      toGraveyard(game, "Llanowar Elves"),
    ];
    toGraveyard(game, "Sol Ring");
    toStep(game, "upkeep");
    settle(game);
    expect(creatures.every((id) => zone(game, id) === "graveyard")).toBe(true);
  });
});

describe("Genasi Enforcers", () => {
  it("pumps only the creatures you control named Genasi Enforcers", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const one = spawn(game, "Genasi Enforcers");
    const two = spawn(game, "Genasi Enforcers");
    const theirs = spawn(game, "Genasi Enforcers", B);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, one, 0);
    expect(pt(game, one)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, two)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("myriad makes a token copy attacking the other opponent", () => {
    const { game, a } = table({ players: 3 });
    const enforcers = spawn(game, "Genasi Enforcers");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: enforcers, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.turn.step === "combat-damage");
    const copies = game.battlefield.filter(
      (id) => id !== enforcers && game.state.objects[id].cardName === "Genasi Enforcers",
    );
    expect(copies.length).toBe(1);
    expect(game.state.objects[copies[0]].attacking).toBe(C);
  });
});

describe("Guildsworn Prowler", () => {
  it("draws a card when it dies not blocking", () => {
    const { game } = table();
    const prowler = spawn(game, "Guildsworn Prowler");
    const before = hand(game).length;
    destroy(game, prowler);
    expect(zone(game, prowler)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("draws nothing when it dies blocking", () => {
    const { game, a, b } = table();
    const prowler = spawn(game, "Guildsworn Prowler");
    toStep(game, "precombat-main", B);
    const giant = spawn(game, "Hill Giant", B);
    a.declareBlockersFn = () => [{ blocker: prowler, attacker: giant }];
    const before = hand(game).length;
    attack(game, b, [giant], A);
    expect(zone(game, prowler)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Eldritch Pact", () => {
  it("target player draws and loses life equal to the cards in their own graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears", B);
    for (let i = 0; i < 5; i++) toGraveyard(game, "Grizzly Bears", A);
    const before = hand(game, B).length;
    const pact = toHand(game, "Eldritch Pact");
    cast(game, pact, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 3);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Insufferable Balladeer", () => {
  it("the chosen opposing creature can't block this turn and is goaded", () => {
    const { game, a } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [target]);
    const balladeer = enter(game, "Insufferable Balladeer");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([target, other]));
    expect(seen.offered[0]).not.toContain(balladeer);
    expect(game.state.objects[target].goadedBy).toEqual([A]);
    expect(game.state.objects[other].goadedBy ?? []).toEqual([]);
    const offer = blockOffer(game, a, [balladeer]);
    const canBlock = (blocker: ObjectId) => offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(target)).toEqual([]);
    expect(canBlock(other)).toContain(balladeer);
  });
});

describe("Bane, Lord of Darkness", () => {
  it("has indestructible only at half your starting life or less", () => {
    const { game } = table();
    const bane = spawn(game, "Bane, Lord of Darkness");
    expect(keywords(game, bane).has("indestructible")).toBe(false);
    game.state.players[A].life = 10;
    expect(keywords(game, bane).has("indestructible")).toBe(true);
  });

  it("the opponent may have you draw a card", () => {
    const { game, b } = table();
    spawn(game, "Bane, Lord of Darkness");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(b, 0);
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before + 1);
  });

  it("if they don't, you may put a creature card with toughness no greater than the dead creature's onto the battlefield", () => {
    const { game, a, b } = table();
    spawn(game, "Bane, Lord of Darkness");
    const bears = spawn(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    const giant = toHand(game, "Hill Giant");
    pickModes(b, 1);
    const seen = pickFromZone(a, elves);
    const before = hand(game).length;
    destroy(game, bears);
    expect(seen.offered).toContain(elves);
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, elves)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });

  it("a token dying doesn't trigger it", () => {
    const { game, b } = table();
    spawn(game, "Bane, Lord of Darkness");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const soldier = game.battlefield.find((id) => game.state.objects[id].cardName === "Soldier Token")!;
    expect(game.state.objects[soldier].isToken).toBe(true);
    pickModes(b, 0);
    const before = hand(game).length;
    destroy(game, soldier);
    expect(hand(game).length).toBe(before);
  });
});

describe("Juvenile Mist Dragon", () => {
  it("taps up to one creature of each opponent, and those don't untap during their controller's next untap step", () => {
    const { game, a } = table({ players: 4 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsOther = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const daves = spawn(game, "Grizzly Bears", D, { tapped: true });
    const seen = watchTargets(a, () => [bobs, carols, daves]);
    enter(game, "Juvenile Mist Dragon");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bobs, bobsOther]));
    expect(seen.offered[0]).not.toContain(carols);
    expect(game.state.objects[bobs].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(true);
    expect(game.state.objects[bobsOther].tapped).toBe(false);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[bobs].tapped).toBe(true);
    toStep(game, "precombat-main", D);
    // Already tapped when chosen, it still skips its controller's next untap.
    expect(game.state.objects[daves].tapped).toBe(true);
  });
});

describe("Nothic", () => {
  it("rolls a d20 as it dies and draws and loses life by the table", () => {
    const { game } = table();
    const nothic = spawn(game, "Nothic");
    const before = hand(game).length;
    destroy(game, nothic);
    const roll = game.state.lastRoll;
    expect(roll?.sides).toBe(20);
    const n = roll!.total === 20 ? 7 : roll!.total >= 10 ? 2 : 1;
    expect(hand(game).length).toBe(before + n);
    expect(life(game)).toBe(20 - n);
  });
});

describe("You're Confronted by Robbers", () => {
  it("Stall for Time taps up to three target creatures", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Hill Giant", B);
    const z = spawn(game, "Craw Wurm", B);
    const w = spawn(game, "Llanowar Elves", B);
    const spell = toHand(game, "You're Confronted by Robbers");
    cast(game, spell, { modes: [0], targets: [ref(x), ref(y), ref(z)] });
    expect([x, y, z].every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.objects[w].tapped).toBe(false);
  });

  it("Call for Aid creates three 1/1 Soldiers", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const spell = toHand(game, "You're Confronted by Robbers");
    cast(game, spell, { modes: [1] });
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);
  });
});

describe("Sigil of Myrkul", () => {
  it("mills a card; with four creature cards then in the graveyard, a creature gets a counter and deathtouch", () => {
    const { game, a } = table();
    spawn(game, "Sigil of Myrkul");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Hill Giant");
    const milled = toLibrary(game, "Craw Wurm");
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, milled)).toBe("graveyard");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, elves]));
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });

  it("does nothing more when the graveyard holds fewer than four creature cards after the mill", () => {
    const { game, a } = table();
    spawn(game, "Sigil of Myrkul");
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Hill Giant");
    toLibrary(game, "Sol Ring");
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "begin-combat");
    settle(game);
    expect(graveyard(game).length).toBe(4);
    expect(seen.asked).toBe(0);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Dire Mimic", () => {
  it("becomes a 5/5 Shapeshifter artifact creature until end of turn, still a Treasure", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const mimic = spawn(game, "Dire Mimic");
    activate(game, mimic, 1);
    expect(types(game, mimic)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, mimic)).toEqual(expect.arrayContaining(["Treasure", "Shapeshifter"]));
    expect(pt(game, mimic)).toEqual({ power: 5, toughness: 5 });
    toStep(game, "precombat-main", B);
    expect(types(game, mimic)).not.toContain("creature");
  });

  it("sacrifices itself for one mana of any color", () => {
    const { game } = table();
    const mimic = spawn(game, "Dire Mimic");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, mimic)).toBe("graveyard");
  });
});

describe("Warehouse Thief", () => {
  it("sacrifices an artifact or creature to exile the top card, which can be played until the end of your next turn", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const thief = spawn(game, "Warehouse Thief");
    const ring = spawn(game, "Sol Ring");
    const top = toLibrary(game, "Sol Ring");
    steal(game, thief, ring);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, top)).toBe("exile");
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main");
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
  });

  it("can't play the exiled card after your next turn ends", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const thief = spawn(game, "Warehouse Thief");
    const bears = spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Sol Ring");
    steal(game, thief, bears);
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "precombat-main");
    toStep(game, "precombat-main");
    expect(() => cast(game, top, { via: "impulse" })).toThrow();
    expect(zone(game, top)).toBe("exile");
  });
});
