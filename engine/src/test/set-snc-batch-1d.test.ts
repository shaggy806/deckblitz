/**
 * Streets of New Capenna, group d. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
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

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Make a Vehicle a creature until end of turn without crewing it. */
const animate = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(
    A,
    { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
    [ref(id)],
  );
};

/** Alice's declare-attackers step with these attacking bob, her priority. */
const toAttacking = (game: Game, seat: ReturnType<typeof table>["a"], attackers: readonly ObjectId[]): void => {
  seat.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-attackers" &&
      s.priority.holder === A &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0 &&
      s.pendingTriggers.length === 0,
  );
};

const castable = (game: Game, card: ObjectId, extra: Partial<Extract<Action, { type: "cast-spell" }>> = {}): boolean =>
  game.canDispatch({ type: "cast-spell", player: A, card, targets: [], ...extra }) === null;

describe("Scepter of Celebration", () => {
  it("gives +2/+0 and trample, and makes a Citizen per point of combat damage to a player", () => {
    const { game, a } = table();
    const scepter = spawn(game, "Scepter of Celebration");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    activate(game, scepter, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "Citizen Token", A)).toBe(4);
  });
});

describe("Smuggler's Buggy", () => {
  const setUp = () => {
    const t = table();
    const bears = toLibrary(t.game, "Grizzly Bears");
    pickFromZone(t.a, bears);
    const buggy = enter(t.game, "Smuggler's Buggy");
    return { ...t, bears, buggy };
  };

  it("hides a card; on combat damage you may cast it free, and if you do the Vehicle returns to hand", () => {
    const { game, a, bears, buggy } = setUp();
    expect(zone(game, bears)).toBe("exile");
    animate(game, buggy);
    a.chooseCastNowFn = (_v, offer) => ({
      type: "cast-spell",
      player: A,
      card: offer.casts[0].card,
      targets: [],
      via: "effect",
      free: true,
    });
    attack(game, a, [buggy]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, buggy)).toBe("hand");
  });

  it("declining the cast leaves the Vehicle on the battlefield", () => {
    const { game, a, bears, buggy } = setUp();
    animate(game, buggy);
    attack(game, a, [buggy]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, buggy)).toBe("battlefield");
  });
});

describe("Mask of the Schemer", () => {
  it("the equipped creature connives X for the damage it dealt: a counter per nonland card discarded", () => {
    const { game, a } = table();
    const mask = spawn(game, "Mask of the Schemer");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    activate(game, mask, 0, { targets: [ref(bears)] });
    const x = toLibrary(game, "Lightning Bolt");
    const y = toLibrary(game, "Divination");
    a.chooseDiscardsFn = (cards, count) => {
      expect(count).toBe(2);
      return cards.filter((c) => c.id === x || c.id === y).map((c) => c.id);
    };
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Misfortune Teller", () => {
  it("exiling a creature card makes a 2/2 Rogue", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, card);
    enter(game, "Misfortune Teller");
    expect(zone(game, card)).toBe("exile");
    expect(tokensNamed(game, "Rogue Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    expect(life(game)).toBe(20);
    expect(pt(game, named(game, "Rogue Token", A)[0])).toEqual({ power: 2, toughness: 2 });
  });

  it("a land creature card makes both a Rogue and a Treasure (the ruling); no life", () => {
    const { game, a } = table();
    const arbor = toGraveyard(game, "Dryad Arbor", B);
    pickTargets(a, arbor);
    enter(game, "Misfortune Teller");
    expect(tokensNamed(game, "Rogue Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(life(game)).toBe(20);
  });

  it("anything else gains 3 life — on combat damage too", () => {
    const { game, a } = table();
    const teller = spawn(game, "Misfortune Teller");
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    attack(game, a, [teller]);
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game)).toBe(23);
    expect(tokensNamed(game, "Rogue Token")).toBe(0);
  });
});

describe("False Floor", () => {
  it("enters tapped; every player's creatures enter tapped", () => {
    const { game } = table();
    const floor = enter(game, "False Floor");
    expect(game.state.objects[floor].tapped).toBe(true);
    const mine = enter(game, "Grizzly Bears");
    const theirs = enter(game, "Grizzly Bears", B);
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("exiles itself and every untapped creature, as a sorcery", () => {
    const { game } = table();
    const floor = spawn(game, "False Floor");
    game.state.objects[floor].tapped = false;
    // They enter tapped under False Floor; one is untapped since.
    const untapped = spawn(game, "Grizzly Bears", B);
    game.state.objects[untapped].tapped = false;
    const tapped = spawn(game, "Hill Giant", B);
    expect(game.state.objects[tapped].tapped).toBe(true);
    lands(game, "Wastes", 2);
    activate(game, floor, 0);
    expect(zone(game, floor)).toBe("exile");
    expect(zone(game, untapped)).toBe("exile");
    expect(zone(game, tapped)).toBe("battlefield");
  });
});

describe("Obscura Charm", () => {
  it("returns a multicolored permanent card with mana value 3 or less tapped — not a monocolored one", () => {
    const { game } = table();
    const wolf = toGraveyard(game, "Watchwolf");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const charm = toHand(game, "Obscura Charm");
    expect(castable(game, charm, { modes: [0], targets: [ref(bears)] })).toBe(false);
    cast(game, charm, { modes: [0], targets: [ref(wolf)] });
    expect(zone(game, wolf)).toBe("battlefield");
    expect(game.state.objects[wolf].tapped).toBe(true);
  });

  it("destroys a creature with mana value 3 or less, not one with more", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const charm = toHand(game, "Obscura Charm");
    expect(castable(game, charm, { modes: [2], targets: [ref(giant)] })).toBe(false);
    cast(game, charm, { modes: [2], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Illicit Shipment", () => {
  it("with casualty paid, the copy tutors too: two cards", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Swamp", 5);
    a.choosePermanentsFn = (_v, eligible) => {
      expect(eligible).toEqual([giant]);
      return [giant];
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Illicit Shipment"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Black Market Tycoon", () => {
  it("makes Treasures, and deals 2 damage to you for each one at your upkeep", () => {
    const { game } = table();
    const tycoon = spawn(game, "Black Market Tycoon");
    activate(game, tycoon, 0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    spawn(game, "Treasure Token");
    toStep(game, "upkeep");
    settle(game);
    expect(life(game)).toBe(16);
  });
});

describe("Widespread Thieving", () => {
  it("a multicolored spell makes a Treasure, which helps pay {W}{U}{B}{R}{G} to play the hidden card free", () => {
    const { game, a } = table();
    const hidden = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, hidden);
    enter(game, "Widespread Thieving");
    expect(zone(game, hidden)).toBe("exile");
    // A debug entry's trigger waits for the next priority pass, which ends
    // the main phase: cast in the next one.
    toStep(game, "postcombat-main");
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    a.chooseCastNowFn = (_v, offer) => ({
      type: "cast-spell",
      player: A,
      card: offer.casts[0].card,
      targets: [],
      via: "effect",
      free: true,
    });
    cast(game, toHand(game, "Watchwolf"));
    expect(zone(game, hidden)).toBe("battlefield");
    // The Treasure paid the {G}.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("a monocolored spell does nothing", () => {
    const { game, a } = table();
    pickFromZone(a, toLibrary(game, "Grizzly Bears"));
    enter(game, "Widespread Thieving");
    toStep(game, "postcombat-main");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Vampire Scrivener", () => {
  it("gaining or losing life during your turn puts a counter on it each time", () => {
    const { game } = table();
    const scrivener = spawn(game, "Vampire Scrivener");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(counters(game, scrivener)).toBe(1);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2, who: "you" }, []);
    settle(game);
    expect(counters(game, scrivener)).toBe(2);
  });

  it("not during an opponent's turn", () => {
    const { game } = table();
    const scrivener = spawn(game, "Vampire Scrivener");
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2, who: "you" }, []);
    settle(game);
    expect(counters(game, scrivener)).toBe(0);
  });
});

describe("Night Clubber", () => {
  it("blitzed, it has haste and its enters trigger shrinks opponents' creatures", () => {
    const { game } = table();
    const small = spawn(game, "Raging Goblin", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    const clubber = toHand(game, "Night Clubber");
    cast(game, clubber, { via: "blitz" });
    expect(keywords(game, clubber).has("haste")).toBe(true);
    expect(zone(game, small)).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Extract the Truth", () => {
  it("you may choose a creature, enchantment or planeswalker card from the revealed hand", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Swamp", 2);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Extract the Truth"), { modes: [0], targets: [ref(B)] });
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("choosing nothing is allowed (the ruling)", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    pickFromZone(a);
    cast(game, toHand(game, "Extract the Truth"), { modes: [0], targets: [ref(B)] });
    expect(zone(game, bears)).toBe("hand");
  });

  it("or the opponent sacrifices an enchantment", () => {
    const { game } = table();
    const anthem = spawn(game, "Glorious Anthem", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Extract the Truth"), { modes: [1], targets: [ref(B)] });
    expect(zone(game, anthem)).toBe("graveyard");
  });
});

describe("Dig Up the Body", () => {
  it("mills two, then returns any creature card from your graveyard (the ruling)", () => {
    const { game, a } = table();
    const old = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 3);
    const before = library(game).length;
    pickFromZone(a, old);
    cast(game, toHand(game, "Dig Up the Body"));
    expect(library(game).length).toBe(before - 2);
    expect(zone(game, old)).toBe("hand");
  });

  it("casualty 1: the copy mills two more", () => {
    const { game, a } = table();
    const memnite = spawn(game, "Memnite");
    lands(game, "Swamp", 3);
    a.choosePermanentsFn = () => [memnite];
    const before = library(game).length;
    cast(game, toHand(game, "Dig Up the Body"));
    expect(library(game).length).toBe(before - 4);
    // Memnite was sacrificed, and is a creature card the copy could return.
    expect(zone(game, memnite)).not.toBe("battlefield");
  });
});

describe("Freelance Muscle", () => {
  it("attacking, gets +X/+X for the greatest power or toughness among other creatures you control", () => {
    const { game, a } = table();
    const muscle = spawn(game, "Freelance Muscle");
    spawn(game, "Wall of Omens");
    spawn(game, "Grizzly Bears");
    toAttacking(game, a, [muscle]);
    settle(game);
    // The Wall's toughness 4 beats any power.
    expect(pt(game, muscle)).toEqual({ power: 8, toughness: 8 });
  });

  it("a power greater than every toughness counts as well", () => {
    const { game, a } = table();
    const muscle = spawn(game, "Freelance Muscle");
    spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [ref(bears)]);
    toAttacking(game, a, [muscle]);
    settle(game);
    expect(pt(game, muscle)).toEqual({ power: 9, toughness: 9 });
  });

  it("with no other creature, X is 0", () => {
    const { game, a } = table();
    const muscle = spawn(game, "Freelance Muscle");
    toAttacking(game, a, [muscle]);
    settle(game);
    expect(pt(game, muscle)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Workshop Warchief", () => {
  it("gains 3 life as it enters and leaves a 4/4 Rhino Warrior when it dies", () => {
    const { game } = table();
    const chief = enter(game, "Workshop Warchief");
    expect(life(game)).toBe(23);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(chief)]);
    settle(game);
    const rhino = named(game, "Rhino Warrior Token", A);
    expect(rhino).toHaveLength(1);
    expect(pt(game, rhino[0])).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Pugnacious Pugilist", () => {
  it("attacking, it brings a tapped and attacking 1/1 Devil", () => {
    const { game, a } = table();
    const pugilist = spawn(game, "Pugnacious Pugilist");
    attack(game, a, [pugilist]);
    expect(tokensNamed(game, "Devil Token", A)).toBe(1);
    expect(life(game, B)).toBe(15);
  });
});

describe("Hostile Takeover", () => {
  it("sets one creature to 1/1 and another to 4/4, then deals 3 damage to each creature", () => {
    const { game } = table();
    const big = spawn(game, "Craw Wurm", B);
    const mine = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant", B);
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Hostile Takeover"), { targets: [ref(big), ref(mine)] });
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("the second target must be another creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    expect(castable(game, toHand(game, "Hostile Takeover"), { targets: [ref(bears), ref(bears)] })).toBe(false);
  });
});

describe("Park Heights Pegasus", () => {
  it("draws on combat damage if two or more creatures entered under your control this turn", () => {
    const { game, a } = table();
    const pegasus = spawn(game, "Park Heights Pegasus");
    enter(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [pegasus]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("not after only one", () => {
    const { game, a } = table();
    const pegasus = spawn(game, "Park Heights Pegasus");
    enter(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [pegasus]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Pyre-Sledge Arsonist", () => {
  it("deals damage equal to the permanents you've sacrificed this turn", () => {
    const { game } = table();
    const arsonist = spawn(game, "Pyre-Sledge Arsonist");
    for (const name of ["Treasure Token", "Grizzly Bears"]) {
      game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(spawn(game, name))]);
      settle(game);
    }
    lands(game, "Mountain", 1);
    activate(game, arsonist, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Psychic Pickpocket", () => {
  it("connives, then — the target chosen afterwards — returns up to one nonland permanent", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    const before = hand(game).length;
    const seen = watchTargets(a, () => [theirs]);
    const pickpocket = enter(game, "Psychic Pickpocket");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).toContain(pickpocket);
    expect(seen.offered[0]).not.toContain(land);
    expect(zone(game, theirs)).toBe("hand");
    // Drew a Wastes and discarded one: a land, so no counter.
    expect(hand(game).length).toBe(before);
    expect(counters(game, pickpocket)).toBe(0);
  });
});

describe("Capenna Express", () => {
  it("sacrificing a Treasure makes it an artifact creature until end of turn", () => {
    const { game } = table();
    const express = spawn(game, "Capenna Express");
    const treasure = spawn(game, "Treasure Token");
    expect(types(game, express)).not.toContain("creature");
    game.dispatch({ type: "activate-ability", player: A, source: express, abilityIndex: 0, targets: [], sacrifice: treasure });
    settle(game);
    expect(types(game, express)).toContain("creature");
    expect(pt(game, express)).toEqual({ power: 6, toughness: 6 });
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
  });
});

describe("Riveteers Decoy", () => {
  it("must be blocked if able", () => {
    const { game, a } = table();
    const decoy = spawn(game, "Riveteers Decoy");
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [decoy]);
    expect(offer.mustBeBlockedIfAble).toEqual([decoy]);
  });

  it("blitzed, it has haste", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const decoy = toHand(game, "Riveteers Decoy");
    cast(game, decoy, { via: "blitz" });
    expect(keywords(game, decoy).has("haste")).toBe(true);
  });
});

describe("Light 'Em Up", () => {
  it("casualty 2 copies it: 2 + 2 damage", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    a.choosePermanentsFn = () => [bears];
    pickTargets(a, giant);
    cast(game, toHand(game, "Light 'Em Up"), { targets: [ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Knockout Blow", () => {
  it("costs {2} less aimed at a red attacking creature; 4 damage and you gain 2", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 1);
    toAttacking(game, a, [giant]);
    cast(game, toHand(game, "Knockout Blow"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game)).toBe(22);
  });

  it("full price at a creature that isn't red", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    toAttacking(game, a, [bears]);
    expect(castable(game, toHand(game, "Knockout Blow"), { targets: [ref(bears)] })).toBe(false);
  });
});

describe("Gathering Throng", () => {
  it("may search for any number of cards named Gathering Throng", () => {
    const { game, a } = table();
    const x = toLibrary(game, "Gathering Throng");
    toLibrary(game, "Grizzly Bears");
    const y = toLibrary(game, "Gathering Throng");
    pickModes(a, 0);
    const seen = pickFromZone(a, x, y);
    enter(game, "Gathering Throng");
    expect([...seen.offered].sort()).toEqual([x, y].sort());
    expect(zone(game, x)).toBe("hand");
    expect(zone(game, y)).toBe("hand");
    expect(graveyard(game)).toHaveLength(0);
  });
});
