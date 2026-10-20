/**
 * Innistrad: Crimson Vow group f — cleave spells, training and exploit
 * creatures, and the older cards that were waiting on training or exploit.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  controller,
  zone,
} from "./harness.js";

const makeToken = (game: Game, token: string): ObjectId => {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(A, { kind: "create-token", token, count: 1 }, []);
  const id = game.battlefield.find((o) => !before.has(o));
  if (id === undefined) throw new Error(`no ${token} made`);
  return id;
};

describe("Cloaked Cadet", () => {
  it("draws once for counters on several Humans at once, and only once a turn", () => {
    const { game } = table();
    spawn(game, "Cloaked Cadet");
    spawn(game, "Elite Vanguard");
    const start = hand(game).length;
    game.debugApplyEffect(
      A,
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      [],
    );
    settle(game);
    expect(hand(game).length).toBe(start + 1);
    game.debugApplyEffect(
      A,
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      [],
    );
    settle(game);
    expect(hand(game).length).toBe(start + 1);
  });

  it("a counter on a non-Human doesn't draw; training's counter on it does", () => {
    const { game, a } = table();
    const cadet = spawn(game, "Cloaked Cadet");
    const bears = spawn(game, "Grizzly Bears");
    const start = hand(game).length;
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(hand(game).length).toBe(start);
    const giant = spawn(game, "Hill Giant");
    attack(game, a, [cadet, giant]);
    expect(counters(game, cadet)).toBe(1);
    expect(hand(game).length).toBe(start + 1);
  });
});

describe("Dig Up", () => {
  it("finds only a basic land normally; cleaved, any card", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 1);
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Dig Up"));
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("hand");

    const { game: g2, a: a2 } = table({ deck: "Grizzly Bears" });
    const bear = g2.state.zones.perPlayer[A].library[0];
    lands(g2, "Swamp", 2);
    lands(g2, "Forest", 1);
    lands(g2, "Wastes", 1);
    const seen2 = pickFromZone(a2, bear);
    cast(g2, toHand(g2, "Dig Up"), { overload: true });
    expect(seen2.offered).toContain(bear);
    expect(zone(g2, bear)).toBe("hand");
  });
});

describe("Dread Fugue", () => {
  it("offers only a nonland card with mana value 2 or less; cleaved, any nonland card", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const giant = toHand(game, "Hill Giant", B);
    toHand(game, "Forest", B);
    lands(game, "Swamp", 1);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Dread Fugue"), { targets: [ref(B)] });
    expect([...seen.offered].sort()).toEqual([bears].sort());
    expect(zone(game, bears)).toBe("graveyard");

    const { game: g2, a: a2 } = table();
    toHand(g2, "Grizzly Bears", B);
    const giant2 = toHand(g2, "Hill Giant", B);
    toHand(g2, "Forest", B);
    lands(g2, "Swamp", 3);
    const seen2 = pickFromZone(a2, giant2);
    cast(g2, toHand(g2, "Dread Fugue"), { targets: [ref(B)], overload: true });
    expect(seen2.offered).toHaveLength(2);
    expect(seen2.offered).toContain(giant2);
    expect(zone(g2, giant2)).toBe("graveyard");
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Gryffwing Cavalry", () => {
  it("trains, and may pay {1}{W} to give an attacking creature without flying flying", () => {
    const { game, a } = table();
    const cavalry = spawn(game, "Gryffwing Cavalry");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    attack(game, a, [cavalry, giant]);
    expect(counters(game, cavalry)).toBe(1);
    expect(keywords(game, giant).has("flying")).toBe(true);
  });

  it("declining the payment gives nothing flying", () => {
    const { game, a } = table();
    const cavalry = spawn(game, "Gryffwing Cavalry");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 2);
    pickModes(a);
    attack(game, a, [cavalry, giant]);
    expect(keywords(game, giant).has("flying")).toBe(false);
  });
});

describe("Lunar Rejection", () => {
  it("bounces only a Wolf or Werewolf normally, any creature cleaved, and draws", () => {
    const { game } = table();
    const wolf = spawn(game, "Kessig Wolf", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    expect(() => cast(game, toHand(game, "Lunar Rejection"), { targets: [ref(bears)] })).toThrow();
    const start = hand(game).length;
    cast(game, toHand(game, "Lunar Rejection"), { targets: [ref(wolf)] });
    expect(zone(game, wolf)).toBe("hand");
    expect(hand(game).length).toBe(start + 1);
    cast(game, toHand(game, "Lunar Rejection"), { targets: [ref(bears)], overload: true });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Parasitic Grasp", () => {
  it("hits only a Human normally; cleaved, any creature; you gain 3 either way", () => {
    const { game } = table();
    const vanguard = spawn(game, "Elite Vanguard", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    expect(() => cast(game, toHand(game, "Parasitic Grasp"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Parasitic Grasp"), { targets: [ref(vanguard)] });
    expect(zone(game, vanguard)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
    cast(game, toHand(game, "Parasitic Grasp"), { targets: [ref(bears)], overload: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(26);
  });
});

describe("Path of Peril", () => {
  it("destroys creatures with mana value 2 or less; cleaved, all creatures", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Path of Peril"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");

    const { game: g2 } = table();
    const giant2 = spawn(g2, "Hill Giant", B);
    lands(g2, "Swamp", 3);
    lands(g2, "Plains", 3);
    cast(g2, toHand(g2, "Path of Peril"), { overload: true });
    expect(zone(g2, giant2)).toBe("graveyard");
  });
});

describe("Stitched Assistant", () => {
  it("exploiting scries 1 then draws; not exploiting draws nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    const card = toHand(game, "Stitched Assistant");
    const start = hand(game).length;
    cast(game, card);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(start); // cast one, drew one

    const { game: g2, a: a2 } = table();
    lands(g2, "Island", 3);
    pickModes(a2);
    const card2 = toHand(g2, "Stitched Assistant");
    const start2 = hand(g2).length;
    cast(g2, card2);
    expect(hand(g2).length).toBe(start2 - 1);
  });
});

describe("Wash Away", () => {
  it("can't counter a spell cast from hand unless cleaved", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const opt = toHand(game, "Opt");
    cast(game, opt, { settle: false });
    expect(() => cast(game, toHand(game, "Wash Away"), { targets: [ref(opt)], settle: false })).toThrow();
    cast(game, toHand(game, "Wash Away"), { targets: [ref(opt)], overload: true });
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("counters a spell cast from a graveyard for {U}", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const tt = toGraveyard(game, "Think Twice");
    cast(game, tt, { via: "flashback", settle: false });
    cast(game, toHand(game, "Wash Away"), { targets: [ref(tt)] });
    // Countered, a flashback spell is exiled instead of going anywhere else.
    expect(zone(game, tt)).toBe("exile");
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});

describe("Winged Portent", () => {
  it("counts creatures with flying normally, every creature cleaved", () => {
    const { game } = table();
    spawn(game, "Storm Crow");
    spawn(game, "Storm Crow");
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const start = hand(game).length;
    const card = toHand(game, "Winged Portent");
    cast(game, card);
    expect(hand(game).length).toBe(start + 2);

    const { game: g2 } = table();
    spawn(g2, "Storm Crow");
    spawn(g2, "Storm Crow");
    spawn(g2, "Grizzly Bears");
    lands(g2, "Island", 5);
    lands(g2, "Forest", 1);
    const start2 = hand(g2).length;
    cast(g2, toHand(g2, "Winged Portent"), { overload: true });
    expect(hand(g2).length).toBe(start2 + 3);
  });
});

describe("Torens, Fist of the Angels", () => {
  it("each creature spell you cast makes a green and white Human Soldier with training", () => {
    const { game, a } = table();
    spawn(game, "Torens, Fist of the Angels");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    const name = "Human Soldier Token (Torens, Fist of the Angels)";
    expect(tokensNamed(game, name)).toBe(1);
    const token = named(game, name)[0];
    // The token trains on a later turn, beside the 2-power Bears.
    toStep(game, "precombat-main");
    attack(game, a, [token, bears]);
    expect(counters(game, token)).toBe(1);
  });
});

describe("Warrior's Resolve", () => {
  it("gives training; a creature with its own training trains twice", () => {
    const { game, a } = table();
    spawn(game, "Warrior's Resolve");
    const bears = spawn(game, "Grizzly Bears");
    const cavalry = spawn(game, "Gryffwing Cavalry");
    const giant = spawn(game, "Hill Giant");
    pickModes(a);
    attack(game, a, [bears, cavalry, giant]);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, cavalry)).toBe(2);
    expect(counters(game, giant)).toBe(0);
  });

  it("draws at your end step only if a creature with a +1/+1 counter attacked this turn", () => {
    const { game, a } = table();
    spawn(game, "Warrior's Resolve");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    attack(game, a, [bears, giant]);
    const start = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(start + 1);

    // Attacking without a counter, and a counter without attacking: nothing.
    const { game: g2, a: a2 } = table();
    spawn(g2, "Warrior's Resolve");
    const crow = spawn(g2, "Storm Crow");
    const idle = spawn(g2, "Grizzly Bears");
    g2.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(idle)]);
    attack(g2, a2, [crow]);
    const start2 = hand(g2).length;
    toStep(g2, "end");
    settle(g2);
    expect(hand(g2).length).toBe(start2);
  });
});

describe("Elder Arthur Maxson", () => {
  it("creature tokens you control have training; nontoken creatures don't", () => {
    const { game, a } = table();
    spawn(game, "Elder Arthur Maxson");
    const soldier = makeToken(game, "Soldier Token");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    toStep(game, "precombat-main");
    attack(game, a, [soldier, bears, giant]);
    expect(counters(game, soldier)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });

  it("sacrificing another creature makes it indestructible until end of turn", () => {
    const { game } = table();
    const arthur = spawn(game, "Elder Arthur Maxson");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: arthur, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(keywords(game, arthur).has("indestructible")).toBe(true);
  });
});

describe("Jenny Flint", () => {
  it("sacrificing a Food puts a +1/+1 counter on another creature you control", () => {
    const { game } = table();
    const jenny = spawn(game, "Jenny Flint");
    const bears = spawn(game, "Grizzly Bears");
    const food = makeToken(game, "Food Token");
    lands(game, "Wastes", 2);
    game.dispatch({ type: "activate-ability", player: A, source: food, abilityIndex: 0, targets: [] });
    settle(game);
    expect(life(game, A)).toBe(23);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, jenny)).toBe(0);
  });

  it("trains beside a creature with greater power", () => {
    const { game, a } = table();
    const jenny = spawn(game, "Jenny Flint");
    const giant = spawn(game, "Hill Giant");
    attack(game, a, [jenny, giant]);
    expect(counters(game, jenny)).toBe(1);
  });
});

describe("Overcharged Amalgam", () => {
  it("exploiting counters a spell on the stack", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 5);
    const opt = toHand(game, "Opt");
    const amalgam = toHand(game, "Overcharged Amalgam");
    const start = hand(game).length;
    cast(game, opt, { settle: false });
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    cast(game, amalgam);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, opt)).toBe("graveyard");
    // Opt never resolved: no card drawn from it.
    expect(hand(game).length).toBe(start - 2);
  });
});

describe("Fell Stinger", () => {
  it("exploiting has target player draw two and lose 2 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    pickTargets(a, B);
    const start = hand(game, B).length;
    cast(game, toHand(game, "Fell Stinger"));
    expect(hand(game, B).length).toBe(start + 2);
    expect(life(game, B)).toBe(18);
  });
});

describe("Infernal Captor", () => {
  it("exploiting steals an artifact or creature until end of turn, untapped with haste", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    lands(game, "Mountain", 4);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    pickTargets(a, giant);
    cast(game, toHand(game, "Infernal Captor"));
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(controller(game, giant)).toBe(B);
  });
});

describe("Colonel Autumn", () => {
  it("another legendary creature you control has exploit, and its exploiting grows your team", () => {
    const { game, a } = table();
    const autumn = spawn(game, "Colonel Autumn");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    const isamaru = toHand(game, "Isamaru, Hound of Konda");
    cast(game, isamaru);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, autumn)).toBe(1);
    expect(counters(game, isamaru)).toBe(1);
  });

  it("a nonlegendary creature doesn't get exploit", () => {
    const { game, a } = table();
    spawn(game, "Colonel Autumn");
    const elf = spawn(game, "Elite Vanguard");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [elf];
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, elf)).toBe("battlefield");
    expect(graveyard(game)).toHaveLength(0);
  });

  it("its own exploit counts too", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    const autumn = toHand(game, "Colonel Autumn");
    cast(game, autumn);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, autumn)).toBe(1);
  });
});
