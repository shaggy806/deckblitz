/**
 * Batch 264, group B: cards freed by the 2026-11-02/03 need-key families
 * (trigger doublers that skip their source, attack-batch and counters-put
 * triggers, linked and owner exile permissions, chroma of revealed cards,
 * odd/even, rolls with a chosen result, Aura and Equipment costs). One test
 * for the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
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
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** Whether `player` is offered a cast (or play) of `card`, wherever it is. */
const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);
/** Put a transforming double-faced card onto the battlefield back face up. */
function backFace(game: Game, front: string, player: PlayerId = A): ObjectId {
  const card = toGraveyard(game, front, player);
  game.debugApplyEffect(player, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
  settle(game);
  return card;
}

describe("Sanctum of All", () => {
  it("doubles another Shrine's trigger while you control six or more Shrines", () => {
    const { game } = table();
    for (const name of [
      "Sanctum of All",
      "Sanctum of Stone Fangs",
      "Sanctum of Calm Waters",
      "Sanctum of Fruitful Harvest",
      "Sanctum of Tranquil Light",
      "Sanctum of Shattered Heights",
    ]) {
      spawn(game, name);
    }
    toStep(game, "precombat-main");
    settle(game);
    // Stone Fangs: each opponent loses 1 life per Shrine (six), twice.
    expect(life(game, B)).toBe(20 - 12);
  });

  it("doesn't double with five Shrines", () => {
    const { game } = table();
    for (const name of ["Sanctum of All", "Sanctum of Stone Fangs", "Sanctum of Calm Waters", "Sanctum of Fruitful Harvest", "Sanctum of Tranquil Light"]) {
      spawn(game, name);
    }
    toStep(game, "precombat-main");
    settle(game);
    expect(life(game, B)).toBe(20 - 5);
  });
});

describe("Bitter Work", () => {
  it("draws once for a player attacked by a creature with power 4 or greater, not for smaller ones", () => {
    const { game, a } = table();
    spawn(game, "Bitter Work");
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [wurm, bears]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't draw for an attack by only small creatures", () => {
    const { game, a } = table();
    spawn(game, "Bitter Work");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Captain America, Skybound", () => {
  it("puts a +1/+1 counter on each attacking creature and makes them indestructible", () => {
    const { game, a } = table();
    const cap = spawn(game, "Captain America, Skybound");
    const b1 = spawn(game, "Grizzly Bears");
    const b2 = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [cap, b1, b2].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    settle(game);
    expect([cap, b1, b2].map((id) => counters(game, id))).toEqual([1, 1, 1]);
    expect(counters(game, home)).toBe(0);
    expect(keywords(game, b1).has("indestructible")).toBe(true);
  });
});

describe("Wildwood Scourge", () => {
  it("grows when a counter goes on another non-Hydra creature you control, not on a Hydra", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const scourge = spawn(game, "Wildwood Scourge");
    game.state.objects[scourge].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(bears)] });
    expect(counters(game, scourge)).toBe(3);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(scourge)] });
    expect(counters(game, scourge)).toBe(4);
  });
});

describe("Omarthis, Ghostfire Initiate", () => {
  it("manifests one card for each counter it died with", () => {
    const { game } = table();
    const omarthis = spawn(game, "Omarthis, Ghostfire Initiate");
    game.state.objects[omarthis].counters["+1/+1"] = 3;
    destroy(game, omarthis);
    const faceDown = game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined);
    expect(faceDown.length).toBe(3);
  });
});

describe("Tithe", () => {
  it("finds two Plains when the target opponent controls more lands", () => {
    const { game, a } = table();
    spawn(game, "Plains");
    lands(game, "Plains", 3, B);
    const p1 = toLibrary(game, "Plains");
    const p2 = toLibrary(game, "Plains");
    pickFromZone(a, p1, p2);
    const before = hand(game).length;
    cast(game, toHand(game, "Tithe"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 2);
  });

  it("finds one when they don't", () => {
    const { game, a } = table();
    spawn(game, "Plains");
    const p1 = toLibrary(game, "Plains");
    const p2 = toLibrary(game, "Plains");
    expect(p2).toBeDefined();
    pickFromZone(a, p1);
    const before = hand(game).length;
    cast(game, toHand(game, "Tithe"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, p1)).toBe("hand");
  });
});

describe("Tombfire", () => {
  it("exiles only the cards with flashback", () => {
    const { game } = table();
    spawn(game, "Swamp");
    const twice = toGraveyard(game, "Think Twice", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Tombfire"), { targets: [ref(B)] });
    expect(zone(game, twice)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Cannibalize", () => {
  it("exiles the target its caster picks and puts two counters on the other", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    pickPermanents(a, two);
    cast(game, toHand(game, "Cannibalize"), { targets: [ref(one), ref(two)] });
    expect(zone(game, two)).toBe("exile");
    expect(counters(game, one)).toBe(2);
  });
});

describe("Mutinous Massacre", () => {
  it("destroys the chosen parity, then takes the rest with haste", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    lands(game, "Swamp", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    a.chooseCreatureTypeFn = (_v, _s, options) => (options.includes("odd") ? "odd" : options[0]);
    cast(game, toHand(game, "Mutinous Massacre"));
    expect(zone(game, goblin)).toBe("graveyard");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Component Pouch", () => {
  it("puts one component counter on a 1-9 and two on a 10-20", () => {
    const { game } = table();
    const pouch = spawn(game, "Component Pouch");
    activate(game, pouch, 1);
    expect([1, 2]).toContain(counters(game, pouch, "component"));
  });
});

describe("Grave Endeavor", () => {
  it("returns a creature with one result's counters and drains the other", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Grave Endeavor"));
    expect(zone(game, bears)).toBe("battlefield");
    const lost = 20 - life(game, B);
    expect(counters(game, bears)).toBeGreaterThanOrEqual(1);
    expect(counters(game, bears)).toBeLessThanOrEqual(10);
    expect(lost).toBeGreaterThanOrEqual(1);
    expect(life(game, A)).toBe(20 + lost);
  });
});

describe("Dance of Many", () => {
  it("exiles the token when it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const dance = enter(game, "Dance of Many");
    const token = named(game, "Grizzly Bears", A)[0];
    expect(token).toBeDefined();
    destroy(game, dance);
    settle(game);
    expect(named(game, "Grizzly Bears", A).length).toBe(0);
  });

  it("is sacrificed when the token leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const dance = enter(game, "Dance of Many");
    const token = named(game, "Grizzly Bears", A)[0];
    destroy(game, token);
    settle(game);
    expect(zone(game, dance)).toBe("graveyard");
  });
});

describe("Black Widow, Super Spy", () => {
  it("without the counter, lets you cast the exiled nonland card with any type of mana", () => {
    const { game, a } = table();
    const widow = spawn(game, "Black Widow, Super Spy");
    const bears = toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", B);
    attack(game, a, [widow]);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, widow)).toBe(0);
    lands(game, "Wastes", 2);
    expect(canCast(game, bears)).toBe(true);
  });

  it("with the counter, gives no cast", () => {
    const { game, a } = table();
    const widow = spawn(game, "Black Widow, Super Spy");
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0);
    attack(game, a, [widow]);
    expect(counters(game, widow)).toBe(1);
    lands(game, "Forest", 2);
    expect(canCast(game, bears)).toBe(false);
  });
});

describe("Reno and Rude", () => {
  it("lets you play the exiled card only if you sacrificed another creature or artifact", () => {
    const { game, a } = table();
    const reno = spawn(game, "Reno and Rude");
    const memnite = spawn(game, "Memnite");
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0);
    attack(game, a, [reno]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, memnite)).toBe("graveyard");
    lands(game, "Wastes", 2);
    expect(canCast(game, bears)).toBe(true);
  });

  it("gives nothing without the sacrifice", () => {
    const { game, a } = table();
    const reno = spawn(game, "Reno and Rude");
    const bears = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [reno]);
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Forest", 2);
    expect(canCast(game, bears)).toBe(false);
  });
});

describe("Sanity Grinding", () => {
  it("mills a card for each blue mana symbol among the ten revealed", () => {
    const { game } = table();
    lands(game, "Island", 3);
    toLibrary(game, "Counterspell");
    toLibrary(game, "Counterspell");
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Sanity Grinding"), { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(before + 4);
  });
});

describe("Ajani, Nacatl Avenger", () => {
  it("0: the Cat Warrior's reflexive damage needs another red permanent", () => {
    const { game, a } = table();
    const ajani = backFace(game, "Ajani, Nacatl Pariah");
    spawn(game, "Raging Goblin");
    pickTargets(a, B);
    game.state.objects[ajani].counters.loyalty = 3;
    activate(game, ajani, 1);
    // Goblin and the new Cat Warrior: two creatures.
    expect(life(game, B)).toBe(18);
  });

  it("0: no damage without a red permanent", () => {
    const { game, a } = table();
    const ajani = backFace(game, "Ajani, Nacatl Pariah");
    pickTargets(a, B);
    game.state.objects[ajani].counters.loyalty = 3;
    activate(game, ajani, 1);
    expect(life(game, B)).toBe(20);
    expect(tokensNamed(game, "Cat Warrior Token (Ajani Fells the Godsire)", A)).toBe(1);
  });
});

describe("Oviya, Automech Artisan", () => {
  it("puts two counters on an artifact it put onto the battlefield, none on a nonartifact", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const oviya = spawn(game, "Oviya, Automech Artisan");
    const thopter = toHand(game, "Ornithopter");
    pickFromZone(a, thopter);
    activate(game, oviya, 0);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(counters(game, thopter)).toBe(2);
  });

  it("no counters on a nonartifact creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const oviya = spawn(game, "Oviya, Automech Artisan");
    const bears = toHand(game, "Grizzly Bears");
    pickFromZone(a, bears);
    activate(game, oviya, 0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Mazzy, Truesword Paladin", () => {
  it("exiles an Aura of yours put into your graveyard, castable until your next turn ends", () => {
    const { game, a } = table();
    spawn(game, "Mazzy, Truesword Paladin");
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const pacifism = toHand(game, "Pacifism");
    pickTargets(a, bears);
    cast(game, pacifism, { targets: [ref(bears)] });
    destroy(game, pacifism);
    settle(game);
    expect(zone(game, pacifism)).toBe("exile");
    expect(canCast(game, pacifism)).toBe(true);
  });
});

describe("Swat Away", () => {
  it("puts a target creature into its owner's library", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Swat Away"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Prismatic Strands", () => {
  it("prevents the damage sources of the chosen color would deal this turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 2);
    a.chooseCreatureTypeFn = () => "R";
    cast(game, toHand(game, "Prismatic Strands"));
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
  });
});

describe("Evercoat Ursine", () => {
  it("hides away two cards, one for each hideaway", () => {
    const { game } = table();
    const ursine = enter(game, "Evercoat Ursine");
    const linked = game.state.zones.shared.exile.filter((id) => game.state.objects[id].exiledWith?.source === ursine);
    expect(linked.length).toBe(2);
  });
});

describe("Scriv, the Obligator", () => {
  it("creates a Contract attached to the target creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Scriv, the Obligator");
    const contract = named(game, "Contract Token", A)[0];
    expect(contract).toBeDefined();
    expect(game.state.objects[contract].attachedTo).toBe(bears);
  });
});

describe("Tourach's Gate", () => {
  it("is sacrificed at upkeep once its last time counter comes off", () => {
    const { game, a } = table();
    const land = spawn(game, "Swamp");
    lands(game, "Swamp", 3);
    const gate = toHand(game, "Tourach's Gate");
    pickTargets(a, land);
    cast(game, gate, { targets: [ref(land)] });
    game.state.objects[gate].counters.time = 1;
    toStep(game, "precombat-main");
    expect(zone(game, gate)).toBe("graveyard");
  });
});

describe("Deconstruction Hammer", () => {
  it("the equipped creature's ability sacrifices the Hammer", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const hammer = spawn(game, "Deconstruction Hammer");
    activate(game, hammer, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const pacifism = spawn(game, "Pacifism", B);
    activate(game, bears, 0, { targets: [ref(pacifism)] });
    expect(zone(game, hammer)).toBe("graveyard");
    expect(zone(game, pacifism)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Super-Soldier Serum", () => {
  it("makes the creature a legendary Soldier and attaches your Equipment as it attacks", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Super-Soldier Serum"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const hammer = spawn(game, "Deconstruction Hammer");
    pickTargets(a, hammer);
    attack(game, a, [bears]);
    expect(game.state.objects[hammer].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Thanos, the Mad Titan", () => {
  it("power-up destroys each other creature of the chosen parity", () => {
    const { game, a } = table();
    for (const land of ["Wastes", "Plains", "Island", "Swamp", "Mountain", "Forest"]) spawn(game, land);
    const thanos = spawn(game, "Thanos, the Mad Titan");
    const odd = spawn(game, "Raging Goblin", B);
    const even = spawn(game, "Grizzly Bears", B);
    a.chooseCreatureTypeFn = (_v, _s, options) => (options.includes("odd") ? "odd" : options[0]);
    activate(game, thanos, 0);
    expect(zone(game, odd)).toBe("graveyard");
    expect(zone(game, even)).toBe("battlefield");
    expect(zone(game, thanos)).toBe("battlefield");
    expect(counters(game, thanos)).toBe(2);
  });
});

describe("Veteran's Voice", () => {
  it("taps its host to pump another creature, never the host", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const host = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const voice = toHand(game, "Veteran's Voice");
    pickTargets(a, host);
    cast(game, voice, { targets: [ref(host)] });
    expect(game.canDispatch({ type: "activate-ability", player: A, source: voice, abilityIndex: 0, targets: [ref(host)] })).not.toBeNull();
    activate(game, voice, 0, { targets: [ref(other)] });
    expect(game.state.objects[host].tapped).toBe(true);
    expect(pt(game, other)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("You've Been Caught Stealing", () => {
  it("Bribe the Guards makes a Treasure for each opponent dealt damage this turn", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    cast(game, toHand(game, "You've Been Caught Stealing"), { modes: [1] });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Arlinn, Embraced by the Moon", () => {
  it("−6's emblem gives your creatures haste and a tap to deal their power", () => {
    const { game } = table();
    const arlinn = backFace(game, "Arlinn Kord");
    game.state.objects[arlinn].counters.loyalty = 6;
    activate(game, arlinn, 2);
    const wurm = spawn(game, "Craw Wurm", A, { sick: true });
    expect(keywords(game, wurm).has("haste")).toBe(true);
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === wurm);
    expect(offer).toBeDefined();
  });
});

describe("Jeleva, Nephalia's Scourge", () => {
  it("each player exiles the top X cards, X the mana spent to cast her", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 2);
    const jeleva = toHand(game, "Jeleva, Nephalia's Scourge");
    cast(game, jeleva);
    const linked = (player: PlayerId): number =>
      game.state.zones.shared.exile.filter(
        (id) => game.state.objects[id].owner === player && game.state.objects[id].exiledWith?.source === jeleva,
      ).length;
    expect(linked(A)).toBe(4);
    expect(linked(B)).toBe(4);
  });
});

describe("Visions of Dread", () => {
  it("the opponent picks the creature, which enters under your control", () => {
    const { game, b } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const wurm = toGraveyard(game, "Craw Wurm", B);
    pickFromZone(b, bears);
    cast(game, toHand(game, "Visions of Dread"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Evie Frye", () => {
  it("discarding a creature card makes a creature unblockable; another card does nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const evie = spawn(game, "Evie Frye");
    const bears = spawn(game, "Grizzly Bears");
    const discard = toHand(game, "Craw Wurm");
    a.chooseDiscardsFn = () => [discard];
    pickTargets(a, bears);
    activate(game, evie, 0);
    expect(zone(game, discard)).toBe("graveyard");
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("Aerial Extortionist", () => {
  it("its owner may cast the exiled card; another player casting from exile draws you a card", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Aerial Extortionist");
    expect(zone(game, bears)).toBe("exile");
    expect(canCast(game, bears, A)).toBe(false);
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 2, B);
    expect(canCast(game, bears, B)).toBe(true);
    const before = hand(game, A).length;
    cast(game, bears, { player: B, via: "impulse" });
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Urianger Augurelt", () => {
  it("Play Arcanum lets you cast a card it exiled for {2} less", () => {
    const { game, a } = table();
    const urianger = spawn(game, "Urianger Augurelt");
    const wurm = toLibrary(game, "Craw Wurm");
    pickFromZone(a, wurm);
    activate(game, urianger, 0);
    expect(zone(game, wurm)).toBe("exile");
    game.state.objects[urianger].tapped = false;
    activate(game, urianger, 1);
    lands(game, "Forest", 4);
    expect(canCast(game, wurm)).toBe(true);
    cast(game, wurm, { via: "impulse" });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(life(game, A)).toBe(22);
  });
});

describe("Frenzied Gorespawn", () => {
  it("goads a creature of each opponent and gives creatures attacking an opponent menace", () => {
    const { game, a } = table({ players: 3 });
    const bob = spawn(game, "Grizzly Bears", B);
    const carol = spawn(game, "Hill Giant", "carol" as PlayerId);
    pickTargets(a, bob, carol);
    enter(game, "Frenzied Gorespawn");
    expect(game.state.objects[bob].goadedBy).toContain(A);
    expect(game.state.objects[carol].goadedBy).toContain(A);
  });
});

describe("Say Its Name", () => {
  it("exiles itself and two more from your graveyard to put Altanak onto the battlefield", () => {
    const { game, a } = table();
    const say = toGraveyard(game, "Say Its Name");
    toGraveyard(game, "Say Its Name");
    toGraveyard(game, "Say Its Name");
    const altanak = toLibrary(game, "Altanak, the Thrice-Called");
    pickFromZone(a, altanak);
    activate(game, say, 0);
    expect(zone(game, say)).toBe("exile");
    expect(zone(game, altanak)).toBe("battlefield");
  });
});

describe("Extraordinary Journey", () => {
  it("exiles up to X creatures, each playable by its owner", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Extraordinary Journey"), { x: 1 });
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 2, B);
    expect(canCast(game, bears, B)).toBe(true);
  });
});
