/**
 * Batch B298, group A: cards whose blocked records were re-read. Each test is
 * on the clause the record said the engine couldn't run.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { lastRollIn } from "../random-results.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const EXTRAS = ["via", "graveyardGrant", "face", "free", "kicked"];

/** Cast or play `card` from where it is, under whatever permission offers it. */
const playOffered = (game: Game, card: ObjectId, player: PlayerId = A): void => {
  const offer = game
    .legalActions(player)
    .find((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card) as
    | (Record<string, unknown> & { kind: string })
    | undefined;
  if (offer === undefined) throw new Error("not offered");
  const extra = Object.fromEntries(EXTRAS.filter((k) => offer[k] !== undefined).map((k) => [k, offer[k]]));
  const type = offer.kind === "play-land" ? "play-land" : "cast-spell";
  game.dispatch({ type, player, card, ...(type === "cast-spell" ? { targets: [] } : {}), ...extra } as Action);
  settle(game);
};

const offered = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card);

describe("Intrepid Paleontologist", () => {
  it("casts a Dinosaur you own from among the cards it exiled, with a finality counter", () => {
    const { game } = table();
    const paleo = spawn(game, "Intrepid Paleontologist");
    const mine = toGraveyard(game, "Ranging Raptors");
    const theirs = toGraveyard(game, "Ranging Raptors", B);
    lands(game, "Forest", 7);
    activate(game, paleo, 1, { targets: [ref(mine)] });
    activate(game, paleo, 1, { targets: [ref(theirs)] });
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(offered(game, theirs)).toBe(false);
    playOffered(game, mine);
    expect(zone(game, mine)).toBe("battlefield");
    expect(counters(game, mine, "finality")).toBe(1);
  });
});

describe("Kagha, Shadow Archdruid", () => {
  it("one play a turn — a land or a permanent spell — among cards milled this turn", () => {
    const { game } = table();
    spawn(game, "Kagha, Shadow Archdruid");
    const old = toGraveyard(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 2 }, []);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(offered(game, old)).toBe(false);
    lands(game, "Forest", 2);
    expect(offered(game, bears)).toBe(true);
    playOffered(game, forest);
    expect(zone(game, forest)).toBe("battlefield");
    expect(offered(game, bears)).toBe(false);
  });
});

describe("Ravenloft Adventurer", () => {
  it("an opponent's dying creature is exiled with a hit counter instead", () => {
    const { game } = table();
    spawn(game, "Ravenloft Adventurer");
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    destroy(game, mine);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, bears, "hit")).toBe(1);
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Emet-Selch, Unsundered", () => {
  it("transforms with fourteen cards in the graveyard; Hades plays lands from it on your turn", () => {
    const { game, a } = table();
    const emet = spawn(game, "Emet-Selch, Unsundered");
    const yard = Array.from({ length: 14 }, () => toGraveyard(game, "Wastes"));
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(pt(game, emet)).toEqual({ power: 6, toughness: 6 });
    toStep(game, "precombat-main");
    playOffered(game, yard[0]);
    expect(zone(game, yard[0])).toBe("battlefield");
  });
});

describe("Cruelclaw's Heist", () => {
  it("only with the gift promised may you cast the exiled card, with mana of any type", () => {
    for (const promised of [false, true]) {
      const { game, a } = table();
      lands(game, "Swamp", 2);
      const div = toHand(game, "Divination", B);
      const heist = toHand(game, "Cruelclaw's Heist");
      const bHand = hand(game, B).length;
      pickFromZone(a, div);
      cast(game, heist, { targets: [ref(B)], ...(promised ? { kicked: true } : {}) });
      expect(zone(game, div)).toBe("exile");
      expect(hand(game, B).length).toBe(bHand - 1 + (promised ? 1 : 0));
      lands(game, "Wastes", 3);
      expect(offered(game, div)).toBe(promised);
      if (promised) {
        const before = hand(game).length;
        playOffered(game, div);
        expect(hand(game).length).toBe(before + 2);
      }
    }
  });
});

describe("Osteomancer Adept", () => {
  it("casts a creature from the graveyard by foraging, and it enters with a finality counter", () => {
    const { game, a } = table();
    const adept = spawn(game, "Osteomancer Adept");
    const bears = toGraveyard(game, "Grizzly Bears");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Wastes");
    lands(game, "Forest", 2);
    expect(offered(game, bears)).toBe(false);
    activate(game, adept, 0);
    pickModes(a, 0);
    playOffered(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "finality")).toBe(1);
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Dawn-Blessed Pennant", () => {
  it("offers only its eight types, and an entering permanent of the chosen one gains 1 life", () => {
    const { game, a } = table();
    let options: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, offeredTypes) => {
      options = offeredTypes;
      return "Elf";
    };
    lands(game, "Wastes", 1);
    const pennant = toHand(game, "Dawn-Blessed Pennant");
    cast(game, pennant);
    expect(options).toEqual(["Elemental", "Elf", "Faerie", "Giant", "Goblin", "Kithkin", "Merfolk", "Treefolk"]);
    enter(game, "Llanowar Elves");
    expect(life(game)).toBe(21);
    enter(game, "Grizzly Bears");
    expect(life(game)).toBe(21);
  });
});

describe("Alesha, Who Smiles at Death", () => {
  it("pays {W/B}{W/B} to return a small creature card tapped and attacking", () => {
    const { game, a } = table();
    const alesha = spawn(game, "Alesha, Who Smiles at Death");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [alesha]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(life(game, B)).toBe(15);
  });
});

describe("Scalelord Reckoner", () => {
  it("destroys a nonland permanent of the opponent whose spell targeted a Dragon", () => {
    const { game, a } = table();
    const reckoner = spawn(game, "Scalelord Reckoner");
    const theirs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    pickTargets(a, theirs);
    cast(game, shock, { player: B, targets: [ref(reckoner)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Long River Lurker", () => {
  it("the targeted creature may be exiled and returned after it deals combat damage", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Long River Lurker");
    const before = game.state.objects[bears].zoneChangeCount ?? 0;
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    const now = named(game, "Grizzly Bears");
    expect(now.length).toBe(1);
    expect(zone(game, now[0])).toBe("battlefield");
    expect(now[0] !== bears || (game.state.objects[bears]?.zoneChangeCount ?? 0) > before).toBe(true);
  });
});

describe("Cavalier of Gales", () => {
  it("dies and is shuffled into its owner's library from the graveyard", () => {
    const { game } = table();
    const cav = spawn(game, "Cavalier of Gales");
    destroy(game, cav);
    expect(zone(game, cav)).toBe("library");
  });
});

describe("Etrata, the Silencer", () => {
  it("the damaged player loses with three hit-counter cards in exile; Etrata goes into the library", () => {
    // Three players, so the game goes on past bob's loss.
    const { game, a } = table({ players: 3 });
    const etrata = spawn(game, "Etrata, the Silencer");
    const victim = spawn(game, "Grizzly Bears", B);
    for (let i = 0; i < 2; i += 1) {
      const card = toExile(game, "Wastes", B);
      game.state.objects[card].counters.hit = 1;
    }
    const mine = toExile(game, "Wastes");
    game.state.objects[mine].counters.hit = 1;
    pickTargets(a, victim);
    attack(game, a, [etrata]);
    expect(zone(game, victim)).toBe("exile");
    expect(counters(game, victim, "hit")).toBe(1);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(zone(game, etrata)).toBe("library");
  });

  it("with fewer than three, nobody loses", () => {
    const { game, a } = table();
    const etrata = spawn(game, "Etrata, the Silencer");
    const victim = spawn(game, "Grizzly Bears", B);
    const mine = toExile(game, "Wastes");
    game.state.objects[mine].counters.hit = 1;
    pickTargets(a, victim);
    attack(game, a, [etrata]);
    expect(game.state.players[B].hasLost).toBe(false);
  });
});

describe("Celebr-8000", () => {
  it("each die gives its result's bonus, and doubles gives double strike", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      const robot = spawn(game, "Celebr-8000");
      toStep(game, "begin-combat");
      settle(game);
      const roll = lastRollIn(game.state, A);
      expect(roll?.results.length).toBe(2);
      const results = roll?.results ?? [];
      const ones = results.filter((r) => r === 1).length;
      expect(pt(game, robot)).toEqual({ power: 3 + ones, toughness: 3 + ones });
      const kw = keywords(game, robot);
      const table6: Record<number, string> = { 2: "menace", 3: "vigilance", 4: "lifelink", 5: "flying", 6: "indestructible" };
      for (const [n, k] of Object.entries(table6)) expect(kw.has(k)).toBe(results.includes(Number(n)));
      expect(kw.has("double-strike")).toBe(results[0] === results[1]);
    }
  });
});

describe("Hive Mind", () => {
  it("each other player copies an instant or sorcery spell", () => {
    const { game } = table();
    spawn(game, "Hive Mind");
    lands(game, "Island", 3);
    const div = toHand(game, "Divination");
    const bBefore = hand(game, B).length;
    const aBefore = hand(game).length;
    cast(game, div);
    expect(hand(game, B).length).toBe(bBefore + 2);
    expect(hand(game).length).toBe(aBefore - 1 + 2);
  });
});

describe("Bladegraft Aspirant", () => {
  it("an Equipment's ability targeting it costs {1} less; targeting another doesn't", () => {
    const { game } = table();
    const aspirant = spawn(game, "Bladegraft Aspirant");
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    expect(() => activate(game, splitter, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, splitter, 0, { targets: [ref(aspirant)] });
    expect(game.state.objects[splitter].attachedTo).toBe(aspirant);
  });
});

describe("Kheru Spellsnatcher", () => {
  it("the countered spell is exiled and castable free for as long as it stays there", () => {
    const { game } = table();
    nextTurn(game);
    lands(game, "Island", 3, B);
    const div = toHand(game, "Divination", B);
    cast(game, div, { player: B, settle: false });
    const effect = registryOf(game).get("Kheru Spellsnatcher").triggered[0].effect as EffectSpec;
    game.debugApplyEffect(A, effect, [ref(div)]);
    settle(game);
    expect(zone(game, div)).toBe("exile");
    nextTurn(game);
    const before = hand(game).length;
    playOffered(game, div);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Pumpkin Bombs", () => {
  it("draws, deals its fuse counters' damage, and changes hands", () => {
    const { game } = table();
    const bombs = spawn(game, "Pumpkin Bombs");
    const before = hand(game).length;
    activate(game, bombs, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before - 2 + 3);
    expect(counters(game, bombs, "fuse")).toBe(1);
    expect(life(game, B)).toBe(19);
    expect(controller(game, bombs)).toBe(B);
  });
});

describe("Ashes of the Abhorrent", () => {
  it("stops activating abilities of cards in graveyards", () => {
    for (const withAshes of [false, true]) {
      const { game } = table();
      if (withAshes) spawn(game, "Ashes of the Abhorrent");
      const devotee = toGraveyard(game, "Abzan Devotee");
      lands(game, "Swamp", 3);
      const index = registryOf(game).get("Abzan Devotee").activated.findIndex((ab) => ab.zone === "graveyard");
      if (withAshes) expect(() => activate(game, devotee, index)).toThrow();
      else {
        activate(game, devotee, index);
        expect(zone(game, devotee)).toBe("hand");
      }
    }
  });
});

describe("Here Comes a New Hero!", () => {
  it("copies a creature with mana value X or less, not more", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    const hero = toHand(game, "Here Comes a New Hero!");
    expect(() => cast(game, hero, { targets: [ref(A), ref(wurm)], x: 2 })).toThrow();
    const before = hand(game).length;
    cast(game, hero, { targets: [ref(A), ref(bears)], x: 2 });
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(1);
  });
});

describe("Synth Eradicator", () => {
  it("declining the energy lets you play the exiled card this turn", () => {
    const { game, a } = table();
    const synth = spawn(game, "Synth Eradicator");
    const forest = toLibrary(game, "Forest");
    pickModes(a);
    attack(game, a, [synth]);
    expect(zone(game, forest)).toBe("exile");
    playOffered(game, forest);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("taking the energy gives no permission", () => {
    const { game, a } = table();
    const synth = spawn(game, "Synth Eradicator");
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0);
    attack(game, a, [synth]);
    expect(game.state.players[A].energy).toBe(2);
    expect(offered(game, forest)).toBe(false);
  });
});

describe("The Kenriths' Royal Funeral", () => {
  it("draws and loses the greatest mana value exiled; legendary spells cost {1} less per card still exiled", () => {
    const { game, a } = table();
    const squee = toGraveyard(game, "Squee, Goblin Nabob");
    const kiki = toGraveyard(game, "Kiki-Jiki, Mirror Breaker");
    pickTargets(a, squee, kiki);
    const before = hand(game).length;
    enter(game, "The Kenriths' Royal Funeral");
    expect(zone(game, squee)).toBe("exile");
    expect(hand(game).length).toBe(before + 5);
    expect(life(game)).toBe(15);
    lands(game, "Mountain", 3);
    const kiki2 = toHand(game, "Kiki-Jiki, Mirror Breaker");
    expect(offered(game, kiki2)).toBe(true);
    game.debugMove(squee, "graveyard");
    settle(game);
    expect(offered(game, kiki2)).toBe(false);
  });
});

describe("Tegwyll's Scouring", () => {
  it("cast at instant speed by tapping three flying creatures, not without them", () => {
    const { game } = table();
    const crows = [spawn(game, "Storm Crow"), spawn(game, "Storm Crow")];
    lands(game, "Swamp", 6);
    const scouring = toHand(game, "Tegwyll's Scouring");
    toStep(game, "upkeep");
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === scouring)).toBe(false);
    crows.push(spawn(game, "Storm Crow"));
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === scouring && o.kicked === true);
    expect(offer).toBeDefined();
    game.dispatch({ type: "cast-spell", player: A, card: scouring, targets: [], kicked: true, tap: crows } as Action);
    settle(game);
    expect(crows.every((c) => zone(game, c) === "graveyard")).toBe(true);
    expect(tokensNamed(game, "Faerie Rogue Token")).toBe(3);
  });
});

describe("Weeping Angel", () => {
  it("its combat damage to a creature is prevented and that creature is shuffled away", () => {
    const { game, a, b } = table();
    const angel = spawn(game, "Weeping Angel");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: angel }];
    attack(game, a, [angel]);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, angel)).toBe("battlefield");
  });

  it("isn't a creature after an opponent casts a creature spell", () => {
    const { game } = table();
    const angel = spawn(game, "Weeping Angel");
    nextTurn(game);
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(game.state.objects[angel].zone).toBe("battlefield");
    expect(types(game, angel)).toEqual(["artifact"]);
  });
});

describe("Bebop, Skull & Crossbones", () => {
  it("may draw X and lose X life, X the counters on it", () => {
    const { game, a } = table();
    const bebop = spawn(game, "Bebop, Skull & Crossbones");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(bebop)]);
    settle(game);
    pickModes(a, 0);
    const before = hand(game).length;
    attack(game, a, [bebop]);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
  });
});
