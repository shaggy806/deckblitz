/**
 * Set walk batch 83, part d (2026-10-16): Tarkir: Dragonstorm (TDM), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
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
  nextTurn,
  pickFromZone,
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
  types,
  watchTargets,
  zone,
} from "./harness.js";

const top = (game: Game): ObjectId | undefined => game.state.zones.perPlayer[A].library[0];

/** Cast two Lightning Bolts at bob (two Mountains are made for them). */
function castTwoBolts(game: Game): void {
  lands(game, "Mountain", 2);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
}

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;
function attackOffer(game: Game): AttackOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((a): a is AttackOffer => a.kind === "declare-attackers");
  if (offer === undefined) throw new Error("alice wasn't asked to attack");
  return offer;
}

describe("Monastery Messenger", () => {
  it("puts a noncreature, nonland card from your graveyard on top of your library", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    const seen = watchTargets(a, () => [bolt]);
    enter(game, "Monastery Messenger");
    expect(seen.offered[0]).toContain(bolt);
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(forest);
    expect(top(game)).toBe(bolt);
  });

  it("may put nothing back (up to one)", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, null);
    enter(game, "Monastery Messenger");
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Equilibrium Adept", () => {
  it("exiles your top card as it enters, playable until the end of your next turn", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    enter(game, "Equilibrium Adept");
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });

  it("gains double strike on your second spell each turn", () => {
    const { game } = table();
    const adept = spawn(game, "Equilibrium Adept");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(keywords(game, adept).has("double-strike")).toBe(false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(keywords(game, adept).has("double-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, adept).has("double-strike")).toBe(false);
  });
});

describe("Iridescent Tiger", () => {
  it("adds WUBRG when it enters, if you cast it", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Iridescent Tiger"));
    const pool = game.state.players[A].manaPool.map((u) => u.type).sort();
    expect(pool).toEqual(["B", "G", "R", "U", "W"]);
  });

  it("adds nothing when put onto the battlefield without being cast", () => {
    const { game } = table();
    enter(game, "Iridescent Tiger");
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });
});

describe("Formation Breaker", () => {
  it("gets +1/+2 while you control a creature with a counter on it", () => {
    const { game } = table();
    const breaker = spawn(game, "Formation Breaker");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, breaker)).toEqual({ power: 2, toughness: 1 });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(bears)]);
    expect(pt(game, breaker)).toEqual({ power: 3, toughness: 3 });
  });

  it("counts a counter on itself", () => {
    const { game } = table();
    const breaker = spawn(game, "Formation Breaker");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(breaker)]);
    expect(pt(game, breaker)).toEqual({ power: 4, toughness: 4 });
  });

  it("can't be blocked by creatures with less power, but can by equal power", () => {
    const { game, a } = table();
    const breaker = spawn(game, "Formation Breaker");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const offer = blockOffer(game, a, [breaker]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).toContain(breaker);
    expect(offer.eligible.find((e) => e.blocker === elves)?.canBlock ?? []).not.toContain(breaker);
  });

  it("isn't blockable by a 2-power creature once its own power is 3", () => {
    const { game, a } = table();
    const breaker = spawn(game, "Formation Breaker");
    spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(named0(game, "Hill Giant"))]);
    expect(pt(game, breaker).power).toBe(3);
    const offer = blockOffer(game, a, [breaker]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).not.toContain(breaker);
    expect(offer.eligible.find((e) => e.blocker === giant)?.canBlock ?? []).toContain(breaker);
  });
});

function named0(game: Game, name: string): ObjectId {
  const id = game.battlefield.find((o) => game.state.objects[o].cardName === name);
  if (id === undefined) throw new Error(`no ${name}`);
  return id;
}

describe("Constrictor Sage", () => {
  it("taps and stuns an opponent's creature as it enters", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    enter(game, "Constrictor Sage");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
  });

  it("renews from the graveyard at sorcery speed, exiling itself", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const sage = toGraveyard(game, "Constrictor Sage");
    lands(game, "Island", 3);
    activate(game, sage, 0, { targets: [ref(giant)] });
    expect(zone(game, sage)).toBe("exile");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
  });
});

describe("Gurmag Rakshasa", () => {
  it("gives an opponent's creature -2/-2 and one of yours +2/+2", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    pickTargets(a, theirs, mine);
    enter(game, "Gurmag Rakshasa");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(pt(game, mine)).toEqual({ power: 5, toughness: 5 });
  });

  it("does nothing without a creature an opponent controls to target", () => {
    const { game, a } = table();
    const mine = spawn(game, "Hill Giant");
    pickTargets(a, mine);
    const rakshasa = enter(game, "Gurmag Rakshasa");
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, rakshasa)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Wayspeaker Bodyguard", () => {
  it("returns a nonland permanent card with mana value 2 or less from your graveyard", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const forest = toGraveyard(game, "Forest");
    const elves = toGraveyard(game, "Llanowar Elves");
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Wayspeaker Bodyguard");
    expect([...seen.offered[0]].sort()).toEqual([bears, elves].sort());
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(seen.offered[0]).not.toContain(forest);
    expect(zone(game, bears)).toBe("hand");
  });

  it("taps an opponent's creature on your second spell each turn", () => {
    const { game } = table();
    spawn(game, "Wayspeaker Bodyguard");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.objects[giant].tapped).toBe(false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("Gurmag Nightwatch", () => {
  it("keeps up to one of the top three on top and mills the rest", () => {
    const { game, a } = table();
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Hill Giant");
    const three = toLibrary(game, "Lightning Bolt");
    const fourth = game.state.zones.perPlayer[A].library[3];
    pickFromZone(a, one);
    enter(game, "Gurmag Nightwatch");
    expect(top(game)).toBe(one);
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, three)).toBe("graveyard");
    expect(zone(game, fourth)).toBe("library");
  });

  it("may keep none, milling all three", () => {
    const { game, a } = table();
    const ids = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Hill Giant"), toLibrary(game, "Lightning Bolt")];
    pickFromZone(a);
    enter(game, "Gurmag Nightwatch");
    for (const id of ids) expect(zone(game, id)).toBe("graveyard");
  });
});

describe("Aegis Sculptor", () => {
  it("exiles two cards from your graveyard at your upkeep for a +1/+1 counter", () => {
    const { game, a } = table();
    const sculptor = spawn(game, "Aegis Sculptor");
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, one, two);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(counters(game, sculptor)).toBe(1);
  });

  it("gets no counter when it declines, or exiles fewer than two", () => {
    const { game, a } = table();
    const sculptor = spawn(game, "Aegis Sculptor");
    const one = toGraveyard(game, "Grizzly Bears");
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, one)).toBe("graveyard");
    expect(counters(game, sculptor)).toBe(0);
    pickModes(a, 0);
    pickFromZone(a, one);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, sculptor)).toBe(0);
  });

  it("has ward {2}", () => {
    const { game } = table();
    const sculptor = spawn(game, "Aegis Sculptor");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(sculptor)] });
    expect(zone(game, sculptor)).toBe("battlefield");
  });
});

describe("Effortless Master", () => {
  it("enters with two +1/+1 counters if it's your second spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const master = toHand(game, "Effortless Master");
    cast(game, master);
    expect(counters(game, master)).toBe(2);
  });

  it("enters with none as your first spell", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const master = toHand(game, "Effortless Master");
    cast(game, master);
    expect(counters(game, master)).toBe(0);
    expect(keywords(game, master).has("menace")).toBe(true);
    expect(keywords(game, master).has("vigilance")).toBe(true);
  });
});

describe("Jeskai Devotee", () => {
  it("gets +1/+1 on your second spell each turn", () => {
    const { game } = table();
    const devotee = spawn(game, "Jeskai Devotee");
    castTwoBolts(game);
    expect(pt(game, devotee)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(pt(game, devotee)).toEqual({ power: 2, toughness: 2 });
  });

  it("filters mana only once each turn", () => {
    const { game } = table();
    const devotee = spawn(game, "Jeskai Devotee");
    lands(game, "Wastes", 2);
    activate(game, devotee, 0);
    expect(() => activate(game, devotee, 0)).toThrow();
  });
});

describe("Furious Forebear", () => {
  it("may return to your hand for {1}{W} when a creature you control dies", () => {
    const { game, a } = table();
    const forebear = toGraveyard(game, "Furious Forebear");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    destroy(game, bears);
    expect(zone(game, forebear)).toBe("hand");
  });

  it("doesn't trigger for an opponent's creature", () => {
    const { game, a } = table();
    const forebear = toGraveyard(game, "Furious Forebear");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    pickModes(a, 0);
    destroy(game, theirs);
    expect(zone(game, forebear)).toBe("graveyard");
  });

  it("doesn't trigger when it dies at the same time as another creature", () => {
    const { game, a } = table();
    const forebear = spawn(game, "Furious Forebear");
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } });
    settle(game);
    expect(zone(game, forebear)).toBe("graveyard");
  });
});

describe("Mammoth Bellow", () => {
  it("makes a 5/5 green Elephant", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Mammoth Bellow"));
    expect(tokensNamed(game, "5/5 Elephant Token", A)).toBe(1);
    const elephant = named0(game, "5/5 Elephant Token");
    expect(pt(game, elephant)).toEqual({ power: 5, toughness: 5 });
  });

  it("harmonizes from the graveyard, a tapped creature's power off the cost, then is exiled", () => {
    const { game } = table();
    const bellow = toGraveyard(game, "Mammoth Bellow");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 3);
    cast(game, bellow, { via: "harmonize", tap: [giant] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(tokensNamed(game, "5/5 Elephant Token", A)).toBe(1);
    expect(zone(game, bellow)).toBe("exile");
  });
});

describe("Krotiq Nestguard", () => {
  it("can attack only once its ability has been activated this turn", () => {
    const { game, a } = table();
    const nest = spawn(game, "Krotiq Nestguard");
    lands(game, "Forest", 3);
    activate(game, nest, 0);
    attack(game, a, [nest]);
    expect(life(game, B)).toBe(16);
  });

  it("can't attack without it", () => {
    const { game } = table();
    const nest = spawn(game, "Krotiq Nestguard");
    spawn(game, "Grizzly Bears");
    expect(attackOffer(game).eligible).not.toContain(nest);
  });
});

describe("Unsparing Boltcaster", () => {
  it("deals 5 damage to an opponent's creature that was dealt damage this turn", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(wurm)] });
    enter(game, "Unsparing Boltcaster");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("has no target when no opponent's creature was dealt damage", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant", B);
    const seen = watchTargets(a);
    enter(game, "Unsparing Boltcaster");
    expect(seen.asked).toBe(0);
  });
});

describe("Reverberating Summons", () => {
  it("becomes a 3/3 Monk creature with haste at the beginning of combat after your second spell", () => {
    const { game } = table();
    const summons = spawn(game, "Reverberating Summons");
    castTwoBolts(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, summons)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(pt(game, summons)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, summons).has("haste")).toBe(true);
    nextTurn(game);
    expect(types(game, summons)).not.toContain("creature");
  });

  it("stays an enchantment with fewer than two spells cast", () => {
    const { game } = table();
    const summons = spawn(game, "Reverberating Summons");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, summons)).not.toContain("creature");
  });

  it("discards your hand and sacrifices itself to draw two", () => {
    const { game } = table();
    const summons = spawn(game, "Reverberating Summons");
    const held = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant")];
    lands(game, "Mountain", 2);
    activate(game, summons, 0);
    expect(zone(game, summons)).toBe("graveyard");
    for (const id of held) expect(zone(game, id)).toBe("graveyard");
    expect(hand(game)).toHaveLength(2);
  });
});

describe("Unrooted Ancestor", () => {
  it("sacrifices another creature to gain indestructible, and taps", () => {
    const { game } = table();
    const ancestor = spawn(game, "Unrooted Ancestor", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    game.dispatch({ type: "activate-ability", player: A, source: ancestor, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(keywords(game, ancestor).has("indestructible")).toBe(true);
    expect(game.state.objects[ancestor].tapped).toBe(true);
  });

  it("can't sacrifice itself", () => {
    const { game } = table();
    const ancestor = spawn(game, "Unrooted Ancestor");
    lands(game, "Wastes", 1);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: ancestor, abilityIndex: 0, targets: [], sacrifice: ancestor }),
    ).not.toBeNull();
  });
});

describe("Snowmelt Stag", () => {
  it("is 5/2 during your turn and 2/5 otherwise, counters on top", () => {
    const { game } = table();
    const stag = spawn(game, "Snowmelt Stag");
    expect(pt(game, stag)).toEqual({ power: 5, toughness: 2 });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(stag)]);
    expect(pt(game, stag)).toEqual({ power: 6, toughness: 3 });
    nextTurn(game);
    expect(pt(game, stag)).toEqual({ power: 3, toughness: 6 });
  });

  it("can be blocked without its ability", () => {
    const { game, a } = table();
    const stag = spawn(game, "Snowmelt Stag");
    spawn(game, "Grizzly Bears", B);
    const bears = named0(game, "Grizzly Bears");
    lands(game, "Island", 7);
    expect(blockOffer(game, a, [stag]).eligible.find((e) => e.blocker === bears)?.canBlock ?? []).toContain(stag);
  });

  it("can't be blocked once {5}{U}{U} is paid", () => {
    const { game, a } = table();
    const stag = spawn(game, "Snowmelt Stag");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 7);
    activate(game, stag, 0);
    a.declareAttackersFn = () => [{ attacker: stag, defender: B }];
    // Bob is never asked to block: combat runs straight to damage.
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.turn.step === "postcombat-main");
    expect(game.state.turn.step).toBe("postcombat-main");
    expect(life(game, B)).toBe(15);
  });
});


describe("Reputable Merchant", () => {
  it("puts a +1/+1 counter on a creature you control as it enters, and again as it dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const merchant = enter(game, "Reputable Merchant");
    expect(counters(game, bears)).toBe(1);
    destroy(game, merchant);
    expect(counters(game, bears)).toBe(2);
    expect(graveyard(game)).toContain(merchant);
  });
});
