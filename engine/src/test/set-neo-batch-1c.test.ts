/**
 * Kamigawa: Neon Dynasty (with Neon Dynasty and Crimson Vow Commander),
 * group c. One test (or two) per card, on its riskiest clause and the edge
 * its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  pickFromZone,
  pickModes,
  pickPermanents,
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

const addCounters = (game: Game, id: ObjectId, amount = 1): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount }, [ref(id)]);
  settle(game);
};

/** Alice's next turn, with the Saga's newest chapter ability resolved. */
const nextChapter = (game: Game): void => {
  toStep(game, "precombat-main");
  settle(game);
};

describe("Katsumasa, the Animator", () => {
  it("a non-Vehicle artifact becomes a 1/1 flier; a Vehicle keeps its printed P/T", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const katsumasa = spawn(game, "Katsumasa, the Animator");
    const ring = spawn(game, "Sol Ring");
    const copter = spawn(game, "Smuggler's Copter");
    activate(game, katsumasa, 0, { targets: [ref(ring)] });
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, ring).has("flying")).toBe(true);
    activate(game, katsumasa, 0, { targets: [ref(copter)] });
    expect(types(game, copter)).toContain("creature");
    expect(pt(game, copter)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, copter).has("flying")).toBe(true);
  });

  it("upkeep: a +1/+1 counter on each of up to three noncreature artifacts, an opponent's included", () => {
    const { game, a } = table();
    spawn(game, "Katsumasa, the Animator");
    const ring = spawn(game, "Sol Ring");
    const stone = spawn(game, "Mind Stone");
    const theirs = spawn(game, "Sol Ring", B);
    pickTargets(a, ring, stone, theirs);
    toStep(game, "upkeep");
    settle(game);
    expect([ring, stone, theirs].map((id) => counters(game, id))).toEqual([1, 1, 1]);
  });
});

describe("Ascendant Acolyte", () => {
  it("enters with a counter per +1/+1 counter among your other creatures, then doubles them at upkeep", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bear = spawn(game, "Grizzly Bears");
    addCounters(game, bear, 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounters(game, theirs, 3);
    const acolyte = toHand(game, "Ascendant Acolyte");
    cast(game, acolyte);
    expect(counters(game, acolyte)).toBe(2);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, acolyte)).toBe(4);
  });
});

describe("Kaima, the Fractured Calm", () => {
  it("goads each opponent's creature enchanted by your Aura, and grows once per creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const kaima = spawn(game, "Kaima, the Fractured Calm");
    const enchanted = spawn(game, "Grizzly Bears", B);
    const plain = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Pacifism"), { targets: [ref(enchanted)] });
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[enchanted].goadedBy).toContain(A);
    expect(game.state.objects[plain].goadedBy).toBeUndefined();
    expect(counters(game, kaima)).toBe(1);
  });

  it("doesn't count a creature you'd already goaded (rule 701.15d)", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Mountain", 3);
    const kaima = spawn(game, "Kaima, the Fractured Calm");
    const impetus = spawn(game, "Grizzly Bears", B);
    const pacified = spawn(game, "Grizzly Bears", B);
    // Shiny Impetus: "enchanted creature … is goaded" — goaded by you already.
    cast(game, toHand(game, "Pacifism"), { targets: [ref(pacified)] });
    cast(game, toHand(game, "Shiny Impetus"), { targets: [ref(impetus)] });
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[pacified].goadedBy).toContain(A);
    expect(counters(game, kaima)).toBe(1);
  });
});

describe("Towashi Guide-Bot", () => {
  it("puts a counter on a creature, and its draw costs {1} less per modified creature you control", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    // An opponent's modified creature doesn't count.
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounters(game, theirs);
    pickTargets(a, bear);
    const bot = enter(game, "Towashi Guide-Bot");
    expect(counters(game, bear)).toBe(1);
    lands(game, "Wastes", 3);
    const before = hand(game).length;
    activate(game, bot, 0);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Master's Rebuke", () => {
  it("your creature deals damage equal to its power to a creature you don't control", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Master's Rebuke"), { targets: [ref(giant), ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    // One-sided: the bear deals nothing back.
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });
});

describe("Network Terminal", () => {
  it("loots by tapping another untapped artifact, and can't without one", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const terminal = spawn(game, "Network Terminal");
    expect(() => activate(game, terminal, 1)).toThrow();
    const ring = spawn(game, "Sol Ring");
    const before = hand(game).length;
    const discarded = graveyard(game).length;
    activate(game, terminal, 1);
    expect(game.state.objects[ring].tapped).toBe(true);
    expect(game.state.objects[terminal].tapped).toBe(true);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(discarded + 1);
  });
});

describe("Covert Technician", () => {
  it("puts an artifact card with mana value up to the combat damage dealt from your hand onto the battlefield", () => {
    const { game, a } = table();
    const technician = spawn(game, "Covert Technician");
    const ring = toHand(game, "Sol Ring");
    const stone = toHand(game, "Mind Stone");
    const powerstone = toHand(game, "Worn Powerstone");
    const seen = pickFromZone(a, stone);
    attack(game, a, [technician]);
    expect(life(game, B)).toBe(18);
    expect(seen.offered).toContain(ring);
    expect(seen.offered).toContain(stone);
    expect(seen.offered).not.toContain(powerstone);
    expect(zone(game, stone)).toBe("battlefield");
  });
});

describe("Hidetsugu, Devouring Chaos", () => {
  it("{B}, sacrifice a creature: scry 2", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const hidetsugu = spawn(game, "Hidetsugu, Devouring Chaos");
    const bear = spawn(game, "Grizzly Bears");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: hidetsugu,
      abilityIndex: 0,
      targets: [],
      sacrifice: bear,
    });
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, hidetsugu)).toBe("battlefield");
    expect(scried).toBe(2);
  });

  it("deals the exiled nonland card's mana value to any target; a land exiled deals nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const hidetsugu = spawn(game, "Hidetsugu, Devouring Chaos");
    const giant = toLibrary(game, "Hill Giant");
    pickTargets(a, B);
    activate(game, hidetsugu, 1);
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, B)).toBe(16);

    game.state.objects[hidetsugu].tapped = false;
    const land = toLibrary(game, "Mountain");
    const seen = watchTargets(a, () => [B]);
    activate(game, hidetsugu, 1);
    expect(zone(game, land)).toBe("exile");
    expect(seen.asked).toBe(0);
    expect(life(game, B)).toBe(16);
  });
});

describe("Okiba Reckoner Raid // Nezumi Road Captain", () => {
  it("drains 1 at I and II, then returns as Nezumi Road Captain, giving Vehicles menace", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const copter = spawn(game, "Smuggler's Copter");
    cast(game, toHand(game, "Okiba Reckoner Raid"));
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    nextChapter(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    expect(keywords(game, copter).has("menace")).toBe(false);
    nextChapter(game);
    const [captain] = named(game, "Okiba Reckoner Raid");
    expect(game.state.objects[captain].face).toBe(1);
    expect(keywords(game, captain).has("menace")).toBe(true);
    expect(keywords(game, copter).has("menace")).toBe(true);
  });
});

describe("Tempered in Solitude", () => {
  it("exiles the top card when a creature attacks alone, not when two attack", () => {
    const { game, a } = table();
    spawn(game, "Tempered in Solitude");
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const first = toLibrary(game, "Lightning Bolt");
    attack(game, a, [bear, giant]);
    expect(zone(game, first)).toBe("library");
    toStep(game, "precombat-main");
    const second = toLibrary(game, "Shock");
    attack(game, a, [bear]);
    expect(zone(game, second)).toBe("exile");
  });
});

describe("Eiganjo Uprising", () => {
  it("X Samurai for you with menace and haste; X minus one for each opponent, without them", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Eiganjo Uprising"), { x: 3 });
    expect(tokensNamed(game, "Samurai Token", A)).toBe(3);
    expect(tokensNamed(game, "Samurai Token", B)).toBe(2);
    expect(tokensNamed(game, "Samurai Token", C)).toBe(2);
    const [mine] = named(game, "Samurai Token", A);
    const [theirs] = named(game, "Samurai Token", B);
    expect(keywords(game, mine).has("haste")).toBe(true);
    expect(keywords(game, mine).has("menace")).toBe(true);
    expect(keywords(game, theirs).has("haste")).toBe(false);
    expect(keywords(game, theirs).has("vigilance")).toBe(true);
  });

  it("with X = 1, the opponents get none", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Eiganjo Uprising"), { x: 1 });
    expect(tokensNamed(game, "Samurai Token", A)).toBe(1);
    expect(tokensNamed(game, "Samurai Token", B)).toBe(0);
  });
});

describe("Kumano Faces Kakkazan // Etching of Kumano", () => {
  it("I pings each opponent and their planeswalkers; II puts a counter on your next creature spell", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const jace = spawn(game, "Jace Beleren", B);
    const loyalty = counters(game, jace, "loyalty");
    cast(game, toHand(game, "Kumano Faces Kakkazan"));
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    expect(counters(game, jace, "loyalty")).toBe(loyalty - 1);
    nextChapter(game);
    lands(game, "Forest", 2);
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear);
    expect(counters(game, bear)).toBe(1);
    nextChapter(game);
    const [etching] = named(game, "Kumano Faces Kakkazan");
    expect(game.state.objects[etching].face).toBe(1);
    expect(keywords(game, etching).has("haste")).toBe(true);
  });

  it("Etching: a creature dealt damage this turn by your source is exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    // Up as its back face, the way chapter III returns it.
    const saga = spawn(game, "Kumano Faces Kakkazan");
    game.debugApplyEffect(A, { kind: "flicker", target: "source", transformed: true, underYourControl: true }, [], {
      source: saga,
    });
    settle(game);
    const [etching] = named(game, "Kumano Faces Kakkazan");
    expect(game.state.objects[etching].face).toBe(1);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("exile");
    // Destroyed without having been dealt damage: it dies as usual.
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Era of Enlightenment // Hand of Enlightenment", () => {
  it("scries 2, gains 2 life, then returns as a first striker", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    cast(game, toHand(game, "Era of Enlightenment"));
    expect(scried).toBe(2);
    nextChapter(game);
    expect(life(game, A)).toBe(22);
    nextChapter(game);
    const [monk] = named(game, "Era of Enlightenment");
    expect(game.state.objects[monk].face).toBe(1);
    expect(keywords(game, monk).has("first-strike")).toBe(true);
    expect(pt(game, monk)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Moonfolk Puzzlemaker", () => {
  it("scries 1 whenever it becomes tapped", () => {
    const { game, a } = table();
    const puzzlemaker = spawn(game, "Moonfolk Puzzlemaker");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    attack(game, a, [puzzlemaker]);
    expect(scried).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Seven-Tail Mentor", () => {
  it("enters or dies: a +1/+1 counter on a creature or Vehicle you control", () => {
    const { game, a } = table();
    const copter = spawn(game, "Smuggler's Copter");
    const bear = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [copter]);
    const mentor = enter(game, "Seven-Tail Mentor");
    expect(seen.offered[0]).toContain(copter);
    expect(seen.offered[0]).toContain(bear);
    expect(counters(game, copter)).toBe(1);
    pickTargets(a, bear);
    destroy(game, mentor);
    expect(counters(game, bear)).toBe(1);
  });
});

describe("Befriending the Moths // Imperial Moth", () => {
  it("I and II pump and give flying; III returns it as a 2/4 flier", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    cast(game, toHand(game, "Befriending the Moths"));
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("flying")).toBe(true);
    nextChapter(game);
    nextChapter(game);
    const [moth] = named(game, "Befriending the Moths");
    expect(game.state.objects[moth].face).toBe(1);
    expect(pt(game, moth)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, moth).has("flying")).toBe(true);
  });
});

describe("Okiba Salvage", () => {
  it("returns a Vehicle card, with two counters when you control an artifact and an enchantment", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Glorious Anthem");
    const copter = toGraveyard(game, "Smuggler's Copter");
    cast(game, toHand(game, "Okiba Salvage"), { targets: [ref(copter)] });
    expect(zone(game, copter)).toBe("battlefield");
    // The returned Vehicle is the artifact.
    expect(counters(game, copter)).toBe(2);
  });

  it("no counters without an artifact", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Glorious Anthem");
    const bear = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Okiba Salvage"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("battlefield");
    expect(counters(game, bear)).toBe(0);
  });
});

describe("Favor of Jukai", () => {
  it("+3/+3 and reach only while the enchanted permanent is a creature", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Favor of Jukai"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bear).has("reach")).toBe(true);
    const copter = spawn(game, "Smuggler's Copter");
    const favor = toHand(game, "Favor of Jukai");
    cast(game, favor, { targets: [ref(copter)] });
    expect(game.state.objects[favor].attachedTo).toBe(copter);
    expect(keywords(game, copter).has("reach")).toBe(false);
  });

  it("channel: discard it to give a creature +3/+3 and reach", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bear = spawn(game, "Grizzly Bears");
    const favor = toHand(game, "Favor of Jukai");
    activate(game, favor, 0, { targets: [ref(bear)] });
    expect(zone(game, favor)).toBe("graveyard");
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bear).has("reach")).toBe(true);
  });
});

describe("Kami's Flare", () => {
  it("3 damage to the creature; 2 more to its controller only if you control a modified creature", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Kami's Flare"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    const bear = spawn(game, "Grizzly Bears");
    addCounters(game, bear);
    const other = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Kami's Flare"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Jukai Preserver", () => {
  it("channel: a +1/+1 counter on each of up to two creatures you control", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const preserver = toHand(game, "Jukai Preserver");
    activate(game, preserver, 0, { targets: [ref(bear), ref(giant)] });
    expect(zone(game, preserver)).toBe("graveyard");
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, giant)).toBe(1);
  });
});

describe("Short Circuit", () => {
  it("an enchanted creature gets -3/-0 and loses flying", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Short Circuit"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 4 });
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(keywords(game, angel).has("vigilance")).toBe(true);
  });
});

describe("Drogskol Reinforcements", () => {
  it("other Spirits have melee; it has melee only once itself", () => {
    const { game, a } = table();
    const drogskol = spawn(game, "Drogskol Reinforcements");
    game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token", count: 1 });
    settle(game);
    const [spirit] = named(game, "Spirit Token", A);
    game.state.objects[spirit].summoningSick = false;
    attack(game, a, [drogskol, spirit]);
    expect(pt(game, drogskol)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
  });

  it("prevents noncombat damage to Spirits you control, not to other creatures", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Drogskol Reinforcements");
    game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token", count: 1 });
    settle(game);
    const [spirit] = named(game, "Spirit Token", A);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Shock"), { targets: [ref(spirit)] });
    expect(zone(game, spirit)).toBe("battlefield");
    cast(game, toHand(game, "Shock"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("Haunted Library", () => {
  it("pay {1} when an opponent's creature dies for a Spirit; your own creature dying doesn't trigger", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    spawn(game, "Haunted Library");
    const mine = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, mine);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});

describe("Scion of Opulence", () => {
  it("a Treasure when it or another nontoken Vampire you control dies; an opponent's doesn't count", () => {
    const { game } = table();
    const scion = spawn(game, "Scion of Opulence");
    destroy(game, spawn(game, "Vampire Neonate", B));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    destroy(game, spawn(game, "Vampire Neonate"));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    destroy(game, scion);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("{R}, sacrifice two artifacts: exile the top card, playable this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const scion = spawn(game, "Scion of Opulence");
    const rings = [spawn(game, "Sol Ring"), spawn(game, "Sol Ring")];
    const top = toLibrary(game, "Hill Giant");
    pickPermanents(a, ...rings);
    activate(game, scion, 0);
    expect(rings.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(zone(game, top)).toBe("exile");
    expect(library(game).includes(top)).toBe(false);
  });
});
