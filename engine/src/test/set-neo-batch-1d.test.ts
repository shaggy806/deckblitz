/**
 * Kamigawa: Neon Dynasty (with Neon Dynasty Commander and Crimson Vow
 * Commander), group d. One test (or two) per card, on its riskiest clause and
 * the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

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
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
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
  watchTargets,
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** `saga`'s back face on alice's battlefield, ready to attack: the Saga
 * exiled and returned transformed (its chapter III effect). */
function flipped(game: Game, saga: string): ObjectId {
  const id = spawn(game, saga);
  settle(game);
  game.debugApplyEffect(A, { kind: "flicker", target: "source", transformed: true, underYourControl: true }, [], {
    source: id,
  });
  settle(game);
  const [back] = named(game, saga);
  game.state.objects[back].summoningSick = false;
  return back;
}

/** Alice's next precombat main, with the Saga's new chapter resolved. */
const nextChapter = (game: Game): void => {
  toStep(game, "precombat-main");
  settle(game);
};

describe("Unquenchable Fury", () => {
  it("the enchanted creature's attack deals damage equal to the defender's hand size", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Unquenchable Fury"), { targets: [ref(bears)] });
    const inHand = hand(game, B).length;
    expect(inHand).toBeGreaterThan(0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20 - inHand - 2);
  });

  it("returns to its owner's hand when put into their graveyard from the battlefield", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const fury = toHand(game, "Unquenchable Fury");
    cast(game, fury, { targets: [ref(bears)] });
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Doom Blade"), { targets: [ref(bears)] });
    const [back] = hand(game).filter((id) => game.state.objects[id].cardName === "Unquenchable Fury");
    expect(back).toBeDefined();
  });

  it("controlled by an opponent, it goes to its owner's graveyard — not theirs — and stays there", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const fury = toHand(game, "Unquenchable Fury");
    cast(game, fury, { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(fury)]);
    expect(game.state.objects[fury].controller).toBe(B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Doom Blade"), { targets: [ref(bears)] });
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Unquenchable Fury")).toBe(false);
    expect(hand(game, B).some((id) => game.state.objects[id].cardName === "Unquenchable Fury")).toBe(false);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Unquenchable Fury")).toBe(true);
  });
});

describe("Myojin of Towering Might", () => {
  it("enters with an indestructible counter only when cast from hand", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const myojin = toHand(game, "Myojin of Towering Might");
    cast(game, myojin);
    expect(counters(game, myojin, "indestructible")).toBe(1);
    const other = toGraveyard(game, "Myojin of Towering Might");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(other)]);
    settle(game);
    expect(counters(game, other, "indestructible")).toBe(0);
  });

  it("removes the counter to distribute eight +1/+1 counters, and the targets gain trample", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const myojin = toHand(game, "Myojin of Towering Might");
    cast(game, myojin);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: myojin,
      abilityIndex: 0,
      targets: [ref(bears), ref(giant)],
      division: [5, 3],
    });
    settle(game);
    expect(counters(game, myojin, "indestructible")).toBe(0);
    expect(counters(game, bears)).toBe(5);
    expect(counters(game, giant)).toBe(3);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, giant).has("trample")).toBe(true);
    expect(keywords(game, myojin).has("trample")).toBe(false);
  });
});

describe("Moonsnare Prototype", () => {
  it("channel: discards itself, and the owner puts the permanent on top or bottom of their library", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Moonsnare Prototype");
    activate(game, card, 1, { targets: [ref(giant)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, giant)).toBe("library");
    expect(library(game, B).includes(giant)).toBe(true);
  });

  it("taps another artifact or creature to add {C}", () => {
    const { game } = table();
    const moonsnare = spawn(game, "Moonsnare Prototype");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, moonsnare, 0);
    expect(game.state.objects[moonsnare].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
});

describe("Mirrorshell Crab", () => {
  it("channel counters a triggered ability unless its controller pays {3}", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const crab = toHand(game, "Mirrorshell Crab");
    const before = hand(game, B).length;
    enter(game, "Elvish Visionary", B, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    const [trigger] = game.state.zones.shared.stack;
    activate(game, crab, 0, { targets: [ref(trigger)] });
    expect(zone(game, crab)).toBe("graveyard");
    // Bob has no mana to pay: no card drawn.
    expect(hand(game, B).length).toBe(before);
  });

  it("the ability's controller may pay {3} to keep it", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    lands(game, "Island", 3, B);
    const crab = toHand(game, "Mirrorshell Crab");
    const before = hand(game, B).length;
    enter(game, "Elvish Visionary", B, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    const [trigger] = game.state.zones.shared.stack;
    pickModes(b, 0);
    activate(game, crab, 0, { targets: [ref(trigger)] });
    expect(hand(game, B).length).toBe(before + 1);
  });
});

describe("Experimental Synthesizer", () => {
  it("exiles the top card to play this turn when it enters and when it leaves; the sacrifice makes a Samurai", () => {
    const { game } = table();
    const first = toLibrary(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const synth = toHand(game, "Experimental Synthesizer");
    cast(game, synth);
    expect(zone(game, first)).toBe("exile");
    const second = toLibrary(game, "Hill Giant");
    activate(game, synth, 0);
    expect(zone(game, synth)).toBe("graveyard");
    expect(zone(game, second)).toBe("exile");
    expect(tokensNamed(game, "Samurai Token", A)).toBe(1);
    // The first exiled card is still playable this turn.
    lands(game, "Forest", 2);
    cast(game, first, { via: "impulse" });
    expect(zone(game, first)).toBe("battlefield");
  });
});

describe("Kappa Tech-Wrecker", () => {
  it("enters with a deathtouch counter", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const kappa = toHand(game, "Kappa Tech-Wrecker");
    cast(game, kappa);
    expect(counters(game, kappa, "deathtouch")).toBe(1);
    expect(keywords(game, kappa).has("deathtouch")).toBe(true);
  });

  it("removes the counter on combat damage to exile an artifact or enchantment that player controls", () => {
    const { game, a } = table();
    const kappa = spawn(game, "Kappa Tech-Wrecker");
    game.state.objects[kappa].counters.deathtouch = 1;
    const ring = spawn(game, "Sol Ring", B);
    spawn(game, "Glorious Anthem", B);
    spawn(game, "Sol Ring", A);
    pickModes(a, 0);
    const seen = watchTargets(a, () => [ring]);
    attack(game, a, [kappa]);
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toHaveLength(2);
    expect(zone(game, ring)).toBe("exile");
    expect(counters(game, kappa, "deathtouch")).toBe(0);
  });

  it("declining keeps the counter and exiles nothing", () => {
    const { game, a } = table();
    const kappa = spawn(game, "Kappa Tech-Wrecker");
    game.state.objects[kappa].counters.deathtouch = 1;
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a);
    attack(game, a, [kappa]);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(counters(game, kappa, "deathtouch")).toBe(1);
  });
});

describe("Mukotai Ambusher", () => {
  it("ninjutsu puts it in attacking, and its lifelink damage gains life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    const ninja = toHand(game, "Mukotai Ambusher");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    const index = game.registry.get("Mukotai Ambusher").activated.findIndex((ab) => ab.ninjutsu === true);
    activate(game, ninja, index);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ninja)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(23);
  });
});

describe("Grafted Growth", () => {
  it("puts a +1/+1 counter on a creature, and the land taps for two mana of one color", () => {
    const { game, a } = table();
    spawn(game, "Forest");
    lands(game, "Wastes", 2);
    const land = spawn(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Grafted Growth"), { targets: [ref(land)] });
    expect(counters(game, bears)).toBe(1);
    // Only the enchanted Wastes is untapped: it pays {1}{G} alone.
    const second = toHand(game, "Grizzly Bears");
    cast(game, second);
    expect(zone(game, second)).toBe("battlefield");
    expect(game.state.objects[land].tapped).toBe(true);
  });
});

describe("The Fall of Lord Konda // Fragment of Konda", () => {
  it("I exiles an opponent's creature with mana value 4+; II returns permanents to their owners; III flips it", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const saga = toHand(game, "The Fall of Lord Konda");
    cast(game, saga, { settle: false });
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    // Alice takes Bob's Bears; chapter II gives them back.
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    expect(game.state.objects[bears].controller).toBe(A);
    nextChapter(game);
    expect(game.state.objects[bears].controller).toBe(B);
    nextChapter(game);
    const [fragment] = named(game, "The Fall of Lord Konda");
    expect(fragment).toBeDefined();
    expect(game.state.objects[fragment].face).toBe(1);
    expect(pt(game, fragment)).toEqual({ power: 1, toughness: 3 });
    expect(keywords(game, fragment).has("defender")).toBe(true);
    const before = hand(game).length;
    destroy(game, fragment);
    expect(hand(game).length).toBe(before + 1);
  });

  it("chapter I can't target a creature with mana value 3 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", A);
    const seen = watchTargets(a, () => [giant]);
    cast(game, toHand(game, "The Fall of Lord Konda"));
    expect([...seen.offered[0]].sort()).toEqual([giant, other].sort());
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Soul Transfer", () => {
  it("chooses both modes while you control an artifact and an enchantment (one permanent may be both)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    // A legendary enchantment artifact: both at once.
    spawn(game, "Whip of Erebos");
    const giant = spawn(game, "Hill Giant", B);
    const dead = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Soul Transfer"), { modes: [0, 1], targets: [ref(giant), ref(dead)] });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, dead)).toBe("hand");
  });

  it("only one mode without both an artifact and an enchantment", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    const dead = toGraveyard(game, "Grizzly Bears");
    expect(() =>
      cast(game, toHand(game, "Soul Transfer"), { modes: [0, 1], targets: [ref(giant), ref(dead)] }),
    ).toThrow();
    cast(game, toHand(game, "Soul Transfer"), { modes: [1], targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("hand");
  });
});

describe("Teachings of the Kirin // Kirin-Touched Orochi", () => {
  it("I mills three and makes a colorless Spirit; II a counter; III returns it as Kirin-Touched Orochi", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const saga = toHand(game, "Teachings of the Kirin");
    const before = graveyard(game).length;
    cast(game, saga);
    expect(graveyard(game).length).toBe(before + 3);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    nextChapter(game);
    // The Spirit or the Bears got it.
    const [spirit] = named(game, "Spirit Token (Colorless)", A);
    expect(counters(game, bears) + counters(game, spirit)).toBe(1);
    nextChapter(game);
    const [orochi] = named(game, "Teachings of the Kirin");
    expect(game.state.objects[orochi].face).toBe(1);
    expect(subtypes(game, orochi)).toEqual(["Snake", "Monk"]);
  });

  it("Orochi's attack exiles a creature card from a graveyard, and when it does, makes a Spirit", () => {
    const { game, a } = table();
    const orochi = flipped(game, "Teachings of the Kirin");
    expect(game.state.objects[orochi].face).toBe(1);
    const dead = toGraveyard(game, "Grizzly Bears", B);
    const spirits = tokensNamed(game, "Spirit Token (Colorless)", A);
    pickModes(a, 0);
    pickTargets(a, dead);
    attack(game, a, [orochi]);
    settle(game);
    expect(zone(game, dead)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(spirits + 1);
  });

  it("the second mode exiles a noncreature card, then counters a creature you control", () => {
    const { game, a } = table();
    const orochi = flipped(game, "Teachings of the Kirin");
    const bears = spawn(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring", B);
    toGraveyard(game, "Hill Giant", B);
    pickModes(a, 1);
    a.chooseTargetsFn = (_view, _source, _specs, options) =>
      options.map((slot) => {
        const want = slot.find((t) => t.kind === "object" && (t.object === ring || t.object === bears));
        return want ?? null;
      });
    attack(game, a, [orochi]);
    settle(game);
    expect(zone(game, ring)).toBe("exile");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Twisted Embrace", () => {
  it("destroys an opponent's creature; an enchanted noncreature artifact gets no bonus", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const ring = spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const aura = toHand(game, "Twisted Embrace");
    cast(game, aura, { targets: [ref(ring)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[aura].attachedTo).toBe(ring);
  });

  it("an enchanted creature gets +1/+1; an opponent's creature can't be enchanted", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const aura = toHand(game, "Twisted Embrace");
    expect(() => cast(game, aura, { targets: [ref(theirs)], settle: false })).toThrow();
    pickTargets(a, theirs);
    cast(game, aura, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Tales of Master Seshiro // Seshiro's Living Legacy", () => {
  it("I and II counter and give vigilance; III returns it as a 5/5 vigilance haste creature", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Tales of Master Seshiro"));
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    nextChapter(game);
    expect(counters(game, bears)).toBe(2);
    nextChapter(game);
    const [legacy] = named(game, "Tales of Master Seshiro");
    expect(game.state.objects[legacy].face).toBe(1);
    expect(pt(game, legacy)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, legacy).has("haste")).toBe(true);
    expect(keywords(game, legacy).has("vigilance")).toBe(true);
  });
});

describe("Imperial Oath", () => {
  it("makes three 2/2 vigilance Samurai and scries 3", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Imperial Oath"));
    expect(tokensNamed(game, "Samurai Token", A)).toBe(3);
  });
});

describe("Futurist Operative", () => {
  it("while tapped it's a 1/1 Human Citizen that can't be blocked; untapped a 3/4 Human Ninja", () => {
    const { game, a, b } = table();
    const op = spawn(game, "Futurist Operative");
    expect(pt(game, op)).toEqual({ power: 3, toughness: 4 });
    expect(subtypes(game, op)).toEqual(["Human", "Ninja"]);
    game.state.objects[op].tapped = true;
    expect(pt(game, op)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, op)).toEqual(["Human", "Citizen"]);
    game.state.objects[op].tapped = false;
    // Attacking taps it: Bob's Bears can't block the 1/1.
    const bears = spawn(game, "Grizzly Bears", B);
    let asked = false;
    b.declareBlockersFn = () => {
      asked = true;
      return [{ blocker: bears, attacker: op }];
    };
    attack(game, a, [op]);
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(19);
  });

  it("an untapped attacker (vigilance) can still be blocked", () => {
    const { game, a } = table();
    const op = spawn(game, "Futurist Operative");
    game.debugApplyEffect(A, { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" }, [
      ref(op),
    ]);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [op]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock).toContain(op);
  });

  it("{2}{U}: untaps it", () => {
    const { game } = table();
    const op = spawn(game, "Futurist Operative", A, { tapped: true });
    lands(game, "Island", 3);
    activate(game, op, 0);
    expect(game.state.objects[op].tapped).toBe(false);
    expect(pt(game, op)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Regent's Authority", () => {
  it("gives a plain creature +2/+2 and no counter", () => {
    const { game } = table();
    spawn(game, "Plains");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Regent's Authority"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, bears)).toBe(0);
  });

  it("instead puts a counter on a legendary creature and gives it +1/+1", () => {
    const { game } = table();
    spawn(game, "Plains");
    const legend = spawn(game, "Isamaru, Hound of Konda");
    cast(game, toHand(game, "Regent's Authority"), { targets: [ref(legend)] });
    expect(counters(game, legend)).toBe(1);
    expect(pt(game, legend)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Reckoner Shakedown", () => {
  it("you may choose a nonland card from the opponent's hand; they discard it", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const target = toHand(game, "Hill Giant", B);
    const seen = pickFromZone(a, target);
    cast(game, toHand(game, "Reckoner Shakedown"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([target]);
    expect(zone(game, target)).toBe("graveyard");
    expect(counters(game, bears)).toBe(0);
  });

  it("if you don't, two +1/+1 counters go on a creature you choose", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const target = toHand(game, "Hill Giant", B);
    pickFromZone(a);
    pickPermanents(a, giant);
    cast(game, toHand(game, "Reckoner Shakedown"), { targets: [ref(B)] });
    expect(zone(game, target)).toBe("hand");
    expect(counters(game, giant)).toBe(2);
  });
});

describe("Kami of Industry", () => {
  it("returns an artifact with mana value 3 or less with haste, sacrificed at the next end step", () => {
    const { game, a } = table();
    const memnite = toGraveyard(game, "Memnite");
    toGraveyard(game, "Sol Ring");
    const big = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [memnite]);
    enter(game, "Kami of Industry");
    expect(seen.offered[0]).not.toContain(big);
    expect(seen.offered[0]).toHaveLength(2);
    expect(zone(game, memnite)).toBe("battlefield");
    expect(keywords(game, memnite).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(zone(game, memnite)).toBe("graveyard");
  });
});

describe("Occult Epiphany", () => {
  it("draws X, discards X, and makes a flying Spirit per card type among the discards", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const creature = toHand(game, "Grizzly Bears");
    const artifactCreature = toHand(game, "Memnite");
    a.chooseDiscardsFn = () => [creature, artifactCreature];
    const before = hand(game).length;
    cast(game, toHand(game, "Occult Epiphany"), { x: 2 });
    expect(hand(game).length).toBe(before);
    expect(zone(game, creature)).toBe("graveyard");
    // Creature and artifact: two card types.
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });
});
