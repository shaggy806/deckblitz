import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Yahenni's Expertise", () => {
  it("shrinks every creature, then casts a mana value 3 or less spell free after the shrink", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    const bears = toHand(game, "Grizzly Bears");
    let offered: string[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.casts.map((c) => game.state.objects[c.card].cardName);
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true };
    };
    toHand(game, "Hill Giant"); // mana value 4: not offered
    cast(game, toHand(game, "Yahenni's Expertise"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(offered).toContain("Grizzly Bears");
    expect(offered).not.toContain("Hill Giant");
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Implement of Combustion", () => {
  it("sacrifices to deal 1 damage to a player, and draws as it goes to the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const implement = spawn(game, "Implement of Combustion");
    const before = hand(game).length;
    activate(game, implement, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(zone(game, implement)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Cogwork Assembler", () => {
  it("copies an opponent's artifact with haste and exiles the token at the next end step", () => {
    const { game } = table();
    lands(game, "Wastes", 7);
    const assembler = spawn(game, "Cogwork Assembler");
    const thopter = spawn(game, "Ornithopter", B);
    activate(game, assembler, 0, { targets: [ref(thopter)] });
    const copies = game.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].controller === A);
    expect(copies.length).toBe(1);
    expect(game.state.objects[copies[0]].cardName).toBe("Ornithopter");
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(game.battlefield.includes(copies[0])).toBe(false);
  });
});

describe("Consulate Turret", () => {
  it("taps for energy, and pays three energy to deal 2 damage", () => {
    const { game } = table();
    const turret = spawn(game, "Consulate Turret");
    activate(game, turret, 0);
    expect(game.state.players[A].energy).toBe(1);
    game.state.players[A].energy = 3;
    game.state.objects[turret].tapped = false;
    activate(game, turret, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("Consulate Crackdown", () => {
  it("exiles only opponents' artifacts, until it leaves the battlefield", () => {
    const { game } = table();
    const mine = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Sol Ring", B);
    const thopter = spawn(game, "Ornithopter", B);
    const crackdown = enter(game, "Consulate Crackdown");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, thopter)).toBe("exile");
    destroy(game, crackdown);
    const back = game.battlefield.filter((id) => game.state.objects[id].controller === B).map((id) => game.state.objects[id].cardName);
    expect(back.sort()).toEqual(["Ornithopter", "Sol Ring"]);
  });
});

describe("Aether Poisoner", () => {
  it("gets two energy as it enters and may pay them as it attacks for a Servo", () => {
    const { game, a } = table();
    const poisoner = enter(game, "Aether Poisoner");
    expect(game.state.players[A].energy).toBe(2);
    pickModes(a, 0);
    attack(game, a, [poisoner]);
    expect(tokensNamed(game, "Servo", A) + tokensNamed(game, "Servo Token", A)).toBe(1);
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("Salvage Scuttler", () => {
  it("returns an artifact you control to its owner's hand as it attacks", () => {
    const { game, a } = table();
    const scuttler = spawn(game, "Salvage Scuttler");
    const ring = spawn(game, "Sol Ring");
    pickPermanents(a, ring);
    attack(game, a, [scuttler]);
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Foundry Hornet", () => {
  it("does nothing without a creature with a +1/+1 counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Foundry Hornet");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("shrinks only opponents' creatures when you control one", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    game.state.objects[mine].counters["+1/+1"] = 1;
    enter(game, "Foundry Hornet");
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Deft Dismissal", () => {
  it("divides 3 damage among attacking creatures, and can't target one that isn't", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [one, two].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    const spell = toHand(game, "Deft Dismissal");
    expect(() => cast(game, spell, { targets: [ref(home)], settle: false })).toThrow(/refused/);
    expect(() => cast(game, spell, { targets: [ref(home)], settle: false })).not.toThrow(/pending/);
    cast(game, spell, { targets: [ref(one), ref(two)], division: [2, 1] });
    expect(zone(game, one)).toBe("graveyard");
    expect(game.state.objects[two].damageMarked).toBe(1);
    expect(zone(game, home)).toBe("battlefield");
  });
});

describe("Celes, Rune Knight", () => {
  it("discards any number, then draws that many plus one", () => {
    const { game, a } = table();
    const before = hand(game).length;
    a.chooseDiscardsFn = (cards) => cards.slice(0, 2).map((c) => c.id);
    enter(game, "Celes, Rune Knight");
    expect(graveyard(game, A).length).toBe(2);
    expect(hand(game).length).toBe(before + 1);
  });

  it("puts a counter on each creature you control when another creature enters from a graveyard", () => {
    const { game } = table();
    const celes = spawn(game, "Celes, Rune Knight");
    const elf = spawn(game, "Grizzly Bears");
    const hill = enter(game, "Hill Giant"); // not from a graveyard: nothing
    expect(counters(game, celes)).toBe(0);
    lands(game, "Swamp", 4);
    const dead = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Zombify"), { targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("battlefield");
    expect(counters(game, celes)).toBe(1);
    expect(counters(game, elf)).toBe(1);
    expect(counters(game, hill)).toBe(1);
    expect(counters(game, dead)).toBe(1);
  });
});

describe("Cavalier of Flame", () => {
  it("dying deals X damage to each opponent and their planeswalkers, X the land cards in your graveyard", () => {
    const { game, a } = table();
    a.chooseDiscardsFn = () => [];
    const cavalier = enter(game, "Cavalier of Flame");
    const walker = spawn(game, "Chandra, Torch of Defiance", B);
    game.state.objects[walker].counters.loyalty = 4;
    toGraveyard(game, "Mountain");
    toGraveyard(game, "Mountain");
    destroy(game, cavalier);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    expect(counters(game, walker, "loyalty")).toBe(2);
  });

  it("pumps your creatures and gives them haste", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const cavalier = spawn(game, "Cavalier of Flame");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    activate(game, cavalier, 0);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});
