/**
 * The set walk: Warhammer 40,000 Commander (40K), the bottom half, group a.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const addCounters = (game: Game, id: ObjectId, n: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: n }, [ref(id)]);
  settle(game);
};
const exileIt = (game: Game, id: ObjectId, by: PlayerId = B): void => {
  game.debugApplyEffect(by, { kind: "exile", target: 0 }, [ref(id)]);
  settle(game);
};

describe("Clamavus", () => {
  it("each creature you control gets +1/+1 per +1/+1 counter on itself — yours only", () => {
    const { game } = table();
    const clamavus = spawn(game, "Clamavus");
    const bears = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounters(game, bears, 2);
    addCounters(game, clamavus, 1);
    addCounters(game, theirs, 2);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, clamavus)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, plain)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Exocrine", () => {
  it("X = 3: enters with three counters and deals 3 to each player and each other creature", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const wurm = spawn(game, "Craw Wurm");
    const theirs = spawn(game, "Grizzly Bears", B);
    const exocrine = toHand(game, "Exocrine");
    cast(game, exocrine, { x: 3 });
    expect(counters(game, exocrine)).toBe(3);
    expect(game.state.objects[exocrine].damageMarked).toBe(0);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });

  it("entering without being cast, X is 0: no counters and no damage", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const exocrine = enter(game, "Exocrine");
    expect(counters(game, exocrine)).toBe(0);
    expect(life(game, B)).toBe(20);
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Birth of the Imperium", () => {
  it("I: a Warrior per opponent; II: each opponent sacrifices a creature; III: two cards per opponent with fewer creatures", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 3);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    cast(game, toHand(game, "Birth of the Imperium"));
    expect(tokensNamed(game, "Astartes Warrior Token", A)).toBe(2);
    toStep(game, "precombat-main");
    settle(game);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
    expect(named(game, "Grizzly Bears", C)).toHaveLength(0);
    toStep(game, "upkeep");
    const before = hand(game).length;
    toStep(game, "precombat-main");
    settle(game);
    // Alice has two creatures; Bob one and Carol none: both have fewer.
    expect(hand(game).length).toBe(before + 1 + 4);
  });

  it("III: an opponent with as many creatures as you doesn't count", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 3);
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    cast(game, toHand(game, "Birth of the Imperium"));
    toStep(game, "precombat-main");
    settle(game);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(2);
    toStep(game, "upkeep");
    const before = hand(game).length;
    toStep(game, "precombat-main");
    settle(game);
    // Two each for alice and bob; only carol (none) has fewer.
    expect(hand(game).length).toBe(before + 1 + 2);
  });
});

describe("Skorpekh Lord", () => {
  it("other artifact creatures you control get +1/+0 and menace; others and itself don't", () => {
    const { game } = table();
    const lord = spawn(game, "Skorpekh Lord");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Ornithopter", B);
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 2 });
    expect(keywords(game, thopter).has("menace")).toBe(true);
    expect(pt(game, lord)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, lord).has("menace")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 0, toughness: 2 });
  });

  it("unearth: back with haste, exiled at the next end step", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const lord = toGraveyard(game, "Skorpekh Lord");
    activate(game, lord, 0);
    expect(zone(game, lord)).toBe("battlefield");
    expect(keywords(game, lord).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(zone(game, lord)).toBe("exile");
  });
});

describe("Noise Marine", () => {
  it("deals damage equal to the spells you've cast this turn, itself included", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Ornithopter"));
    pickTargets(a, B);
    cast(game, toHand(game, "Noise Marine"));
    expect(life(game, B)).toBe(18);
  });
});

describe("Primaris Eliminator", () => {
  it("Executioner Round destroys target creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Primaris Eliminator");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Hyperfrag Round gives only the target player's creatures -2/-2", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, B);
    const eliminator = enter(game, "Primaris Eliminator");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, eliminator)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Canoptek Tomb Sentinel", () => {
  it("cast from a hand, Exile Cannon doesn't trigger", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Canoptek Tomb Sentinel"));
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("unearthed, it enters from a graveyard and exiles up to one nonland permanent", () => {
    const { game, a } = table();
    lands(game, "Wastes", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const sentinel = toGraveyard(game, "Canoptek Tomb Sentinel");
    const seen = watchTargets(a, (offered) => [offered[0].includes(bears) ? bears : null]);
    activate(game, sentinel, 0);
    expect(seen.asked).toBe(1);
    // Lands aren't offered.
    expect(seen.offered[0].some((id) => game.state.objects[id as ObjectId]?.cardName === "Wastes")).toBe(false);
    expect(zone(game, bears)).toBe("exile");
    expect(keywords(game, sentinel).has("haste")).toBe(true);
  });
});

describe("Triarch Praetorian", () => {
  it("unearthed: you draw two cards and lose 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const praetorian = toGraveyard(game, "Triarch Praetorian");
    const before = hand(game).length;
    activate(game, praetorian, 0);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });

  it("cast from a hand: no draw", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const card = toHand(game, "Triarch Praetorian");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1);
    expect(life(game, A)).toBe(20);
  });
});

describe("Nurgle's Rot", () => {
  it("enchants only a creature an opponent controls", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const rot = toHand(game, "Nurgle's Rot");
    expect(() => cast(game, rot, { targets: [ref(mine)] })).toThrow();
    cast(game, rot, { targets: [ref(theirs)] });
    expect(game.state.objects[rot].attachedTo).toBe(theirs);
  });

  it("when the enchanted creature dies, the Rot returns to hand and you get a Plaguebearer of Nurgle", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const theirs = spawn(game, "Grizzly Bears", B);
    const rot = toHand(game, "Nurgle's Rot");
    cast(game, rot, { targets: [ref(theirs)] });
    destroy(game, theirs);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, rot)).toBe("hand");
    const [token] = named(game, "Plaguebearer of Nurgle", A);
    expect(token).toBeDefined();
    expect(pt(game, token)).toEqual({ power: 1, toughness: 3 });
    expect(game.state.objects[token].isToken).toBe(true);
  });

  it("destroyed together with its creature, the Rot is still found in the graveyard (rule 400.7f)", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Plains", 4);
    const theirs = spawn(game, "Grizzly Bears", B);
    const rot = toHand(game, "Nurgle's Rot");
    cast(game, rot, { targets: [ref(theirs)] });
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { typesAnyOf: ["creature", "enchantment"] } }, []);
    settle(game);
    expect(zone(game, rot)).toBe("hand");
    expect(tokensNamed(game, "Plaguebearer of Nurgle", A)).toBe(1);
  });
});

describe("Space Marine Devastator", () => {
  it("squad once: two Devastators, each destroying up to one artifact or enchantment", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const ring = spawn(game, "Sol Ring", B);
    const pacifism = spawn(game, "Mind Stone", B);
    const chosen: ObjectId[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      const pick = legal[0].find((t) => t.kind === "object" && !chosen.includes(t.object));
      if (pick?.kind === "object") chosen.push(pick.object);
      return [pick ?? null];
    };
    cast(game, toHand(game, "Space Marine Devastator"), { kicked: true, kickCount: 1 });
    expect(named(game, "Space Marine Devastator", A)).toHaveLength(2);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, pacifism)).toBe("graveyard");
  });
});

describe("Vanguard Suppressor", () => {
  it("squad: a flying token copy; combat damage to a player draws a card", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Vanguard Suppressor"), { kicked: true, kickCount: 1 });
    const suppressors = named(game, "Vanguard Suppressor", A);
    expect(suppressors).toHaveLength(2);
    for (const id of suppressors) expect(keywords(game, id).has("flying")).toBe(true);
    const attacker = spawn(game, "Vanguard Suppressor");
    const before = hand(game).length;
    attack(game, a, [attacker]);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Their Number Is Legion and Poxwalkers", () => {
  it("X tapped Necron Warriors, then life for every artifact you control; the spell is exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    spawn(game, "Sol Ring");
    const legion = toHand(game, "Their Number Is Legion");
    cast(game, legion, { x: 2 });
    const warriors = named(game, "Necron Warrior Token", A);
    expect(warriors).toHaveLength(2);
    for (const id of warriors) expect(game.state.objects[id].tapped).toBe(true);
    expect(life(game, A)).toBe(23);
    expect(zone(game, legion)).toBe("exile");
  });

  it("cast from the graveyard, it brings Poxwalkers back tapped; a spell from the hand doesn't", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const pox = toGraveyard(game, "Poxwalkers");
    cast(game, toHand(game, "Ornithopter"));
    expect(zone(game, pox)).toBe("graveyard");
    const legion = toGraveyard(game, "Their Number Is Legion");
    game.dispatch({ type: "cast-spell", player: A, card: legion, targets: [], xValue: 1, via: "graveyard-permission" });
    settle(game);
    expect(zone(game, pox)).toBe("battlefield");
    expect(game.state.objects[pox].tapped).toBe(true);
    expect(named(game, "Necron Warrior Token", A)).toHaveLength(1);
    expect(zone(game, legion)).toBe("exile");
  });
});

describe("Chaos Mutation", () => {
  it("exiles creatures of different players; each controller reveals until a creature and puts it in", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const wurm = toLibrary(game, "Craw Wurm", B);
    cast(game, toHand(game, "Chaos Mutation"), { targets: [ref(bobs), ref(carols), null, null] });
    expect(zone(game, bobs)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].controller).toBe(B);
    // Carol's library is all Wastes: she reveals it all and finds nothing.
    expect(named(game, "Craw Wurm", C)).toHaveLength(0);
    expect(game.state.zones.perPlayer[C].library.length).toBeGreaterThan(30);
  });

  it("two targets controlled by one player aren't allowed", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Chaos Mutation"), { targets: [ref(one), ref(two), null, null] })).toThrow();
  });
});

describe("Psychomancer", () => {
  it("drains for itself and another nontoken artifact going to a graveyard or exile — not for a token", () => {
    const { game } = table();
    const psycho = spawn(game, "Psychomancer");
    const ring = spawn(game, "Sol Ring");
    const stone = spawn(game, "Mind Stone");
    destroy(game, ring);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    exileIt(game, stone);
    expect(life(game, B)).toBe(18);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    const [treasure] = named(game, "Treasure Token", A);
    destroy(game, treasure);
    expect(life(game, B)).toBe(18);
    destroy(game, psycho);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Cryptek", () => {
  it("only another artifact creature you control; when it dies this turn it returns tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const cryptek = spawn(game, "Cryptek");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Ornithopter", B);
    for (const wrong of [cryptek, bears, theirs]) {
      expect(() => activate(game, cryptek, 0, { targets: [ref(wrong)] })).toThrow();
    }
    activate(game, cryptek, 0, { targets: [ref(thopter)] });
    destroy(game, thopter);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(game.state.objects[thopter].tapped).toBe(true);
    expect(game.state.objects[thopter].controller).toBe(A);
  });
});

describe("Assault Intercessor", () => {
  it("a creature an opponent controls dying costs that player 2 life; yours don't", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Assault Intercessor");
    const carols = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears");
    destroy(game, carols);
    expect(life(game, C)).toBe(18);
    expect(life(game, B)).toBe(20);
    destroy(game, mine);
    expect(life(game, A)).toBe(20);
  });
});

describe("Mutalith Vortex Beast", () => {
  it("one flip per opponent: each won flip draws a card, each lost one deals 3 to that opponent", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game } = table({ players: 3, seed });
      const before = hand(game).length;
      enter(game, "Mutalith Vortex Beast");
      const hurt = [B, C].filter((p) => life(game, p) === 17).length;
      for (const p of [B, C]) expect([17, 20]).toContain(life(game, p));
      expect(hand(game).length - before).toBe(2 - hurt);
      expect(life(game, A)).toBe(20);
    }
  });
});

describe("Let the Galaxy Burn", () => {
  it("X plus 2 damage to each creature that didn't enter this turn", () => {
    const { game } = table();
    const old = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    toStep(game, "precombat-main"); // alice's next turn
    lands(game, "Mountain", 7);
    const fresh = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Let the Galaxy Burn"), { x: 1 });
    expect(zone(game, old)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    expect(zone(game, fresh)).toBe("battlefield");
    expect(game.state.objects[fresh].damageMarked).toBe(0);
  });
});

describe("Deny the Witch", () => {
  it("counters a spell; its controller loses life equal to the creatures you control", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1, B);
    toStep(game, "precombat-main", B);
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Deny the Witch"), { targets: [ref(shock)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("counters an activated ability; its controller loses the life", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const pyro = spawn(game, "Prodigal Pyromancer", B);
    toStep(game, "precombat-main", B);
    activate(game, pyro, 0, { player: B, targets: [ref(A)], settle: false });
    const ability = game.state.zones.shared.stack[game.state.zones.shared.stack.length - 1];
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Deny the Witch"), { targets: [ref(ability)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
  });
});

describe("Screamer-Killer", () => {
  it("a creature spell with mana value 5 or more deals 5 to any target; a smaller one doesn't", () => {
    const { game, a } = table();
    lands(game, "Forest", 8);
    spawn(game, "Screamer-Killer");
    pickTargets(a, B);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Craw Wurm"));
    expect(life(game, B)).toBe(15);
  });
});

describe("Shard of the Void Dragon", () => {
  it("attacking, each opponent sacrifices a nonland permanent", () => {
    const { game, a } = table();
    const shard = spawn(game, "Shard of the Void Dragon");
    const land = spawn(game, "Swamp", B);
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, a, [shard]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
  });

  it("two +1/+1 counters whenever any artifact goes to a graveyard or exile from the battlefield", () => {
    const { game } = table();
    const shard = spawn(game, "Shard of the Void Dragon");
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone");
    destroy(game, ring);
    expect(counters(game, shard)).toBe(2);
    exileIt(game, stone);
    expect(counters(game, shard)).toBe(4);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(counters(game, shard)).toBe(4);
  });
});

describe("Aspiring Champion", () => {
  it("combat damage: sacrificed, the next creature card enters, and a Demon deals its power to each opponent", () => {
    const { game, a } = table({ players: 3 });
    const champion = spawn(game, "Aspiring Champion");
    const demon = toLibrary(game, "Archfiend of Sorrows");
    attack(game, a, [champion]);
    expect(zone(game, champion)).toBe("graveyard");
    expect(zone(game, demon)).toBe("battlefield");
    const power = pt(game, demon).power;
    expect(life(game, B)).toBe(20 - 3 - power);
    expect(life(game, C)).toBe(20 - power);
  });

  it("a creature that isn't a Demon deals nothing", () => {
    const { game, a } = table();
    const champion = spawn(game, "Aspiring Champion");
    const bears = toLibrary(game, "Grizzly Bears");
    attack(game, a, [champion]);
    expect(zone(game, champion)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    expect(graveyard(game)).toContain(champion);
  });
});
